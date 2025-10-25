import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Submission } from '@/models';

// GET endpoint to retrieve user submissions
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const questId = searchParams.get('questId');
    const verified = searchParams.get('verified');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Build query - query directly by walletAddress for better performance
    let query: any = { walletAddress: walletAddress.toLowerCase() };
    
    if (questId) {
      query.questId = questId;
    }
    
    if (verified !== null && verified !== undefined) {
      query.verified = verified === 'true';
    }

    // Only select necessary fields for performance
    const submissions = await Submission.find(query)
      .select('questId verified submittedAt impactPointsEarned')
      .sort({ submittedAt: -1 })
      .lean(); // Use lean() for faster queries when you don't need mongoose documents

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
