import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Submission, User } from '@/models';

// Update submission status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { verified, adminNotes } = await request.json();
    const submission = await Submission.findById(params.id)
      .populate('userId', 'walletAddress')
      .populate('questId', 'title impactPoints');

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission
    submission.verified = verified;
    if (adminNotes) {
      submission.adminNotes = adminNotes;
    }

    // If approved and not already credited, award points
    if (verified && submission.impactPointsEarned === 0) {
      submission.impactPointsEarned = submission.questId.impactPoints;
      
      // Update user's total points
      await User.findByIdAndUpdate(submission.userId._id, {
        $inc: { totalImpactPoints: submission.questId.impactPoints },
      });
    }

    await submission.save();

    return NextResponse.json({
      success: true,
      submission,
      message: verified ? 'Submission approved' : 'Submission rejected',
    });
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Delete submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const submission = await Submission.findByIdAndDelete(params.id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
