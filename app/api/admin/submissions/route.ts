import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Submission } from '@/models';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'pending', 'verified', 'all'
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Check cache
    const cacheKey = `submissions:${status || 'all'}:${limit}:${skip}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('Returning cached submissions');
      return NextResponse.json(cached);
    }

    let query: any = {};
    
    if (status === 'pending') {
      query.verified = false;
    } else if (status === 'verified') {
      query.verified = true;
    }

    // Use lean() for better performance and select only needed fields
    const submissions = await Submission.find(query)
      .populate('userId', 'walletAddress level totalImpactPoints')
      .populate('questId', 'title impactPoints category')
      .select('walletAddress imageUrl verified aiResponse impactPointsEarned submittedAt questId userId')
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Submission.countDocuments(query);

    const response = {
      success: true,
      submissions,
      count: submissions.length,
      total,
      hasMore: skip + submissions.length < total,
    };

    // Cache for 30 seconds
    cache.set(cacheKey, response, CACHE_TTL.SHORT);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
