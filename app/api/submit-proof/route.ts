import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Quest, Submission, CompletedQuest } from '@/models';
import realtimeManager, { REALTIME_EVENTS } from '@/lib/realtime';

// Helper function to archive completed quests
async function archiveCompletedQuest(questId: string) {
  try {
    await dbConnect();
    
    const quest = await Quest.findById(questId);
    if (!quest || quest.status !== 'completed') {
      console.log(`Quest ${questId} not found or not in completed status`);
      return;
    }

    // Get all users who completed this quest
    const completions = await Submission.find({
      questId: quest._id,
      verified: true
    }).select('walletAddress submittedAt impactPointsEarned');

    // Create archived quest record
    const archivedQuest = new CompletedQuest({
      originalQuestId: quest._id,
      title: quest.title,
      description: quest.description,
      category: quest.category,
      impactPoints: quest.impactPoints,
      totalCompletions: quest.completionCount,
      completedBy: completions.map(c => ({
        walletAddress: c.walletAddress,
        completedAt: c.submittedAt,
        pointsEarned: c.impactPointsEarned || quest.impactPoints
      })),
      questCompletedAt: quest.completedAt,
      archivedAt: new Date(),
      questCreatedAt: quest.createdAt
    });

    await archivedQuest.save();

    // Update quest status to archived
    quest.status = 'archived';
    quest.archivedAt = new Date();
    await quest.save();

    // Emit real-time event for quest archiving
    realtimeManager.emit(REALTIME_EVENTS.QUEST_ARCHIVED, {
      quest: quest.toObject(),
      archivedQuest: archivedQuest.toObject(),
      timestamp: Date.now(),
    });

    console.log(`✅ Quest ${questId} archived successfully`);
  } catch (error) {
    console.error(`❌ Error archiving quest ${questId}:`, error);
  }
}

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

      // Update quest completion count and status
      quest.completionCount += 1;
      
      // Check if quest should be marked as completed
      const shouldComplete = quest.maxCompletions && quest.completionCount >= quest.maxCompletions;
      
      if (shouldComplete) {
        quest.status = 'completed';
        quest.completedAt = new Date();
        
        // Schedule quest archiving after configured time
        setTimeout(async () => {
          await archiveCompletedQuest(quest._id.toString());
        }, quest.autoArchiveAfter || 86400000); // Default 24 hours
      }
      
      await quest.save();

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
        questStatus: quest.status,
        completionCount: quest.completionCount,
        maxCompletions: quest.maxCompletions,
        timestamp: Date.now(),
      });

      // If quest is now completed, emit quest updated event
      if (shouldComplete) {
        realtimeManager.emit(REALTIME_EVENTS.QUEST_UPDATED, {
          quest: quest.toObject(),
          timestamp: Date.now(),
        });
      }
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
