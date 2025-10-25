import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Quest, Submission } from '@/models';
import realtimeManager, { REALTIME_EVENTS } from '@/lib/realtime';

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

    // Emit real-time event for submission creation
    realtimeManager.emit(REALTIME_EVENTS.SUBMISSION_CREATED, {
      submission: submission.toObject(),
      questId: quest._id,
      walletAddress: walletAddress.toLowerCase(),
      timestamp: Date.now(),
    });

    let blockchainResult = null;

    // If verified and quest has blockchain ID, trigger oracle to mint tokens
    if (isVerified && quest.blockchainQuestId) {
      try {
        // Call oracle service to mint tokens on blockchain
        const oracleResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oracle/verify-and-mint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAddress: walletAddress,
            questId: quest.blockchainQuestId,
            proofData: imageData,
          }),
        });

        const oracleData = await oracleResponse.json();
        
        if (oracleData.success) {
          blockchainResult = {
            transactionHash: oracleData.transactionHash,
            blockNumber: oracleData.blockNumber,
          };
          console.log('Tokens minted on blockchain:', oracleData.transactionHash);
        } else {
          console.error('Oracle minting failed:', oracleData.error);
          // Don't fail the whole request if blockchain fails
          // User still gets MongoDB points
        }
      } catch (oracleError: any) {
        console.error('Error calling oracle:', oracleError.message);
        // Continue with MongoDB update even if blockchain fails
      }
    }

    // Update user stats if verified (MongoDB tracking + real-time events)
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

      // Emit real-time events for verification and user update
      realtimeManager.emit(REALTIME_EVENTS.SUBMISSION_VERIFIED, {
        submission: submission.toObject(),
        questId: quest._id,
        walletAddress: walletAddress.toLowerCase(),
        pointsEarned: quest.impactPoints,
        timestamp: Date.now(),
      });

      realtimeManager.emit(REALTIME_EVENTS.USER_UPDATED, {
        walletAddress: walletAddress.toLowerCase(),
        user: user.toObject(),
        timestamp: Date.now(),
      });

      realtimeManager.emit(REALTIME_EVENTS.QUEST_COMPLETED, {
        questId: quest._id,
        walletAddress: walletAddress.toLowerCase(),
        pointsEarned: quest.impactPoints,
        timestamp: Date.now(),
      });
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
      blockchain: blockchainResult, // Include blockchain transaction info
    });
  } catch (error: any) {
    console.error('Error submitting proof:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
