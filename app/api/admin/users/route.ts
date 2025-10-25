import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Check cache for user stats (only for first page)
    const cacheKey = `${CACHE_KEYS.USER_STATS}:${limit}:${skip}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('Returning cached user stats');
      return NextResponse.json(cached);
    }

    // Use lean() for better performance and select only needed fields
    const users = await User.find({})
      .select('walletAddress level totalImpactPoints completedQuests stage rewardTokens createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    
    // Use aggregation for total points calculation - more efficient
    const statsResult = await User.aggregate([
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$totalImpactPoints' },
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    const stats = statsResult[0] || { totalPoints: 0, totalUsers: 0 };

    const response = {
      success: true,
      users,
      count: users.length,
      total: stats.totalUsers,
      totalPoints: stats.totalPoints,
      hasMore: skip + users.length < stats.totalUsers,
    };

    // Cache for 1 minute
    cache.set(cacheKey, response, CACHE_TTL.MEDIUM);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
