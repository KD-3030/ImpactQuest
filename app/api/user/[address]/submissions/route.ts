import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Submission } from '@/models';

// Get user's submissions
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    await dbConnect();

    const walletAddress = params.address.toLowerCase();

    const submissions = await Submission.find({ walletAddress })
      .populate('questId', 'title impactPoints category location')
      .sort({ submittedAt: -1 })
      .limit(100);

    // Note: questId will be null if the quest was deleted
    // Frontend handles this by skipping those submissions in the UI

    return NextResponse.json({
      success: true,
      submissions,
      count: submissions.length,
    });
  } catch (error: any) {
    console.error('Error fetching user submissions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
