import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { RewardTransaction, User } from '@/models';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get walletAddress from the authenticated user's session or query params
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get limit from query params (default 50)
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch user's transactions
    const transactions = await RewardTransaction.find({
      walletAddress: walletAddress.toLowerCase()
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error fetching user reward transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
