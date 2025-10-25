import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Redemption } from '@/models';

// GET /api/admin/redemptions - Get all redemptions
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const redemptions = await Redemption.find(query)
      .populate('userId', 'walletAddress currentStage')
      .populate('shopId', 'name category location')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      redemptions,
      count: redemptions.length,
    });
  } catch (error: any) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
