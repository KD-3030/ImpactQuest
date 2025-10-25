import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { CompletedQuest } from '@/models';

// GET endpoint to retrieve completed/archived quests
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const walletAddress = searchParams.get('walletAddress');

    let query: any = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by wallet address if provided (quests this user completed)
    if (walletAddress) {
      query['completedBy.walletAddress'] = walletAddress.toLowerCase();
    }

    const completedQuests = await CompletedQuest.find(query)
      .sort({ archivedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await CompletedQuest.countDocuments(query);

    return NextResponse.json({
      success: true,
      quests: completedQuests,
      count: completedQuests.length,
      totalCount,
      hasMore: totalCount > skip + limit,
    });
  } catch (error: any) {
    console.error('Error fetching completed quests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
