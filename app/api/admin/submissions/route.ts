import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Submission } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'pending', 'verified', 'all'

    let query: any = {};
    
    if (status === 'pending') {
      query.verified = false;
    } else if (status === 'verified') {
      query.verified = true;
    }

    const submissions = await Submission.find(query)
      .populate('userId', 'walletAddress level totalImpactPoints')
      .populate('questId', 'title impactPoints')
      .sort({ submittedAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      submissions,
      count: submissions.length,
    });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
