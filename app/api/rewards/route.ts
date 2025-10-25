import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, RewardTransaction } from '@/models';
import { calculateRewardsSummary } from '@/lib/rewards';

// GET /api/rewards - Get user's reward transactions and summary
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // Filter by type

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Build query
    let query: any = { walletAddress: walletAddress.toLowerCase() };
    if (type) {
      query.type = type;
    }

    // Get reward transactions
    const transactions = await RewardTransaction.find(query)
      .populate('questId', 'title category impactPoints')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Calculate rewards summary
    const summary = calculateRewardsSummary(
      user.totalImpactPoints,
      user.rewardTokens,
      user.totalRewardsEarned
    );

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        rewardTokens: user.rewardTokens,
        discountRate: user.discountRate,
        stage: user.stage,
        totalRewardsEarned: user.totalRewardsEarned,
      },
      summary,
      transactions,
      count: transactions.length,
    });
  } catch (error: any) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
