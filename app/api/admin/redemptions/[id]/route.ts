import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Redemption, User, RewardTransaction } from '@/models';

// PATCH /api/admin/redemptions/[id] - Update redemption status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be "completed" or "cancelled"' },
        { status: 400 }
      );
    }

    // Find the redemption
    const redemption = await Redemption.findById(id);
    if (!redemption) {
      return NextResponse.json(
        { success: false, error: 'Redemption not found' },
        { status: 404 }
      );
    }

    if (redemption.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Only pending redemptions can be updated' },
        { status: 400 }
      );
    }

    // If cancelling, refund tokens to user
    if (status === 'cancelled') {
      const user = await User.findById(redemption.userId);
      if (user) {
        user.rewardTokens += redemption.tokensRedeemed;
        await user.save();

        // Create refund transaction
        await RewardTransaction.create({
          userId: user._id,
          walletAddress: user.walletAddress,
          type: 'redemption_refund',
          amount: redemption.tokensRedeemed,
          description: `Refund for cancelled redemption ${redemption.redemptionCode}`,
        });
      }
    }

    // Update redemption status
    redemption.status = status;
    if (status === 'completed') {
      redemption.completedAt = new Date();
    }
    await redemption.save();

    await redemption.populate('userId', 'walletAddress currentStage');
    await redemption.populate('shopId', 'name category location');

    return NextResponse.json({
      success: true,
      redemption,
      message: status === 'completed' 
        ? 'Redemption marked as completed' 
        : 'Redemption cancelled and tokens refunded',
    });
  } catch (error: any) {
    console.error('Error updating redemption:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/admin/redemptions/[id] - Get single redemption
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    const redemption = await Redemption.findById(id)
      .populate('userId', 'walletAddress currentStage totalImpactPoints')
      .populate('shopId', 'name category location imageUrl')
      .lean();

    if (!redemption) {
      return NextResponse.json(
        { success: false, error: 'Redemption not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      redemption,
    });
  } catch (error: any) {
    console.error('Error fetching redemption:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
