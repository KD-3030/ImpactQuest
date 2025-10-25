import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Quest, Submission } from '@/models';

// Mock AI verification function (replace with actual OpenAI Vision API later)
async function verifyImageWithAI(imageData: string, verificationPrompt: string): Promise<boolean> {
  // For now, return true to simulate successful verification
  // TODO: Integrate OpenAI Vision API
  console.log('Mock AI verification:', verificationPrompt);
  return true;
}

// Calculate stage based on impact points
function calculateStage(points: number): string {
  if (points >= 600) return 'forest';
  if (points >= 300) return 'tree';
  if (points >= 100) return 'sprout';
  return 'seedling';
}

// Calculate level based on impact points
function calculateLevel(points: number): number {
  return Math.floor(points / 50) + 1;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { walletAddress, questId, imageData } = body;

    // Validate required fields
    if (!walletAddress || !questId || !imageData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get quest details
    const quest = await Quest.findById(questId);
    if (!quest) {
      return NextResponse.json(
        { success: false, error: 'Quest not found' },
        { status: 404 }
      );
    }

    // Get or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        level: 1,
        totalImpactPoints: 0,
        completedQuests: 0,
        stage: 'seedling',
      });
    }

    // Check if user already completed this quest
    const existingSubmission = await Submission.findOne({
      userId: user._id,
      questId: quest._id,
      verified: true,
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'You have already completed this quest' },
        { status: 400 }
      );
    }

    // Verify image with AI
    const isVerified = await verifyImageWithAI(imageData, quest.verificationPrompt);

    // Create submission record
    const submission = await Submission.create({
      userId: user._id,
      questId: quest._id,
      walletAddress: walletAddress.toLowerCase(),
      imageUrl: imageData, // In production, upload to IPFS or cloud storage
      verified: isVerified,
      aiResponse: isVerified ? 'Verified successfully' : 'Verification failed',
      impactPointsEarned: isVerified ? quest.impactPoints : 0,
    });

    // Update user stats if verified
    if (isVerified) {
      const newTotalPoints = user.totalImpactPoints + quest.impactPoints;
      const newStage = calculateStage(newTotalPoints);
      const newLevel = calculateLevel(newTotalPoints);

      user.totalImpactPoints = newTotalPoints;
      user.completedQuests += 1;
      user.stage = newStage;
      user.level = newLevel;
      user.updatedAt = new Date();
      await user.save();
    }

    return NextResponse.json({
      success: true,
      verified: isVerified,
      submission,
      user: {
        level: user.level,
        totalImpactPoints: user.totalImpactPoints,
        completedQuests: user.completedQuests,
        stage: user.stage,
      },
      pointsEarned: isVerified ? quest.impactPoints : 0,
    });
  } catch (error: any) {
    console.error('Error submitting proof:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
