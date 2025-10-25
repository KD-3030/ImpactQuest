import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    await dbConnect();

    const walletAddress = params.address.toLowerCase();

    let user = await User.findOne({ walletAddress });

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        walletAddress,
        level: 1,
        totalImpactPoints: 0,
        completedQuests: 0,
        stage: 'seedling',
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
