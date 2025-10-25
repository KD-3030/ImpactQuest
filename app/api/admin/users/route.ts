import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const users = await User.find({}).sort({ createdAt: -1 });
    
    const totalPoints = users.reduce((sum, user) => sum + user.totalImpactPoints, 0);

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
      totalPoints,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
