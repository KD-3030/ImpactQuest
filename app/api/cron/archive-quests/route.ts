import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Quest, CompletedQuest, Submission } from '@/models';
import realtimeManager, { REALTIME_EVENTS } from '@/lib/realtime';

// Helper function to archive a single quest
async function archiveQuest(quest: any) {
  try {
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
      completedBy: completions.map((c: any) => ({
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

    return { success: true, questId: quest._id };
  } catch (error: any) {
    console.error(`Error archiving quest ${quest._id}:`, error);
    return { success: false, questId: quest._id, error: error.message };
  }
}

// POST endpoint to manually trigger archiving (protected by API key)
export async function POST(request: NextRequest) {
  try {
    // Simple API key protection (you should use environment variables in production)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find all completed quests that should be archived
    const now = Date.now();
    const questsToArchive = await Quest.find({
      status: 'completed',
      completedAt: { $exists: true }
    });

    // Filter quests that have passed their autoArchiveAfter time
    const expiredQuests = questsToArchive.filter(quest => {
      const completedTime = new Date(quest.completedAt).getTime();
      const archiveAfter = quest.autoArchiveAfter || 86400000; // Default 24 hours
      return (now - completedTime) >= archiveAfter;
    });

    console.log(`Found ${expiredQuests.length} quests to archive`);

    // Archive each expired quest
    const results = await Promise.all(
      expiredQuests.map(quest => archiveQuest(quest))
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Archived ${successCount} quests (${failureCount} failures)`,
      archived: successCount,
      failed: failureCount,
      results
    });
  } catch (error: any) {
    console.error('Error in archive cron job:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check how many quests need archiving (for monitoring)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const now = Date.now();
    const questsToArchive = await Quest.find({
      status: 'completed',
      completedAt: { $exists: true }
    });

    // Filter quests that have passed their autoArchiveAfter time
    const expiredQuests = questsToArchive.filter(quest => {
      const completedTime = new Date(quest.completedAt).getTime();
      const archiveAfter = quest.autoArchiveAfter || 86400000;
      return (now - completedTime) >= archiveAfter;
    });

    return NextResponse.json({
      success: true,
      pendingArchive: expiredQuests.length,
      quests: expiredQuests.map(q => ({
        id: q._id,
        title: q.title,
        completedAt: q.completedAt,
        timeUntilArchive: 0
      }))
    });
  } catch (error: any) {
    console.error('Error checking archive status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
