import mongoose from 'mongoose';
import realtimeManager, { REALTIME_EVENTS } from './realtime';

/**
 * Setup MongoDB Change Streams for real-time database monitoring
 * This provides true database-level real-time updates
 * 
 * Note: Change Streams require MongoDB 3.6+ and a replica set or sharded cluster
 * For local development, you can use MongoDB Atlas (free tier)
 */

let changeStreamsInitialized = false;

export async function initializeChangeStreams() {
  if (changeStreamsInitialized) {
    console.log('Change streams already initialized');
    return;
  }

  try {
    const { Quest, User, Submission } = await import('@/models');

    // Watch for Quest changes
    const questChangeStream = Quest.watch([], {
      fullDocument: 'updateLookup', // Get full document on updates
    });

    questChangeStream.on('change', (change: any) => {
      console.log('Quest collection changed:', change.operationType);

      switch (change.operationType) {
        case 'insert':
          realtimeManager.emit(REALTIME_EVENTS.QUEST_CREATED, {
            quest: change.fullDocument,
            timestamp: Date.now(),
          });
          break;

        case 'update':
        case 'replace':
          realtimeManager.emit(REALTIME_EVENTS.QUEST_UPDATED, {
            quest: change.fullDocument,
            timestamp: Date.now(),
          });
          break;

        case 'delete':
          realtimeManager.emit(REALTIME_EVENTS.QUEST_UPDATED, {
            questId: change.documentKey._id,
            deleted: true,
            timestamp: Date.now(),
          });
          break;
      }
    });

    questChangeStream.on('error', (error) => {
      console.error('Quest change stream error:', error);
    });

    // Watch for User changes
    const userChangeStream = User.watch([], {
      fullDocument: 'updateLookup',
    });

    userChangeStream.on('change', (change: any) => {
      console.log('User collection changed:', change.operationType);

      if (change.operationType === 'update' || change.operationType === 'replace') {
        realtimeManager.emit(REALTIME_EVENTS.USER_UPDATED, {
          user: change.fullDocument,
          walletAddress: change.fullDocument.walletAddress,
          timestamp: Date.now(),
        });
      }
    });

    userChangeStream.on('error', (error) => {
      console.error('User change stream error:', error);
    });

    // Watch for Submission changes
    const submissionChangeStream = Submission.watch([], {
      fullDocument: 'updateLookup',
    });

    submissionChangeStream.on('change', async (change: any) => {
      console.log('Submission collection changed:', change.operationType);

      if (change.operationType === 'insert') {
        const submission = change.fullDocument;
        
        realtimeManager.emit(REALTIME_EVENTS.SUBMISSION_CREATED, {
          submission,
          questId: submission.questId,
          walletAddress: submission.walletAddress,
          timestamp: Date.now(),
        });

        // If verified, emit completion event
        if (submission.verified) {
          realtimeManager.emit(REALTIME_EVENTS.SUBMISSION_VERIFIED, {
            submission,
            questId: submission.questId,
            walletAddress: submission.walletAddress,
            pointsEarned: submission.impactPointsEarned,
            timestamp: Date.now(),
          });

          realtimeManager.emit(REALTIME_EVENTS.QUEST_COMPLETED, {
            questId: submission.questId,
            walletAddress: submission.walletAddress,
            pointsEarned: submission.impactPointsEarned,
            timestamp: Date.now(),
          });
        }
      }
    });

    submissionChangeStream.on('error', (error) => {
      console.error('Submission change stream error:', error);
    });

    changeStreamsInitialized = true;
    console.log('✅ MongoDB Change Streams initialized successfully');
    console.log('📡 Real-time database monitoring active');

  } catch (error) {
    console.error('Failed to initialize change streams:', error);
    console.warn('Change streams require MongoDB replica set or Atlas cluster');
    console.warn('Falling back to manual event emission in API routes');
  }
}

/**
 * Check if MongoDB supports change streams
 */
export async function supportsChangeStreams(): Promise<boolean> {
  try {
    const admin = mongoose.connection.db?.admin();
    if (!admin) return false;

    const serverStatus = await admin.serverStatus();
    const version = serverStatus.version;
    
    // Change streams require MongoDB 3.6+
    const major = parseInt(version.split('.')[0]);
    const minor = parseInt(version.split('.')[1]);
    
    if (major > 3 || (major === 3 && minor >= 6)) {
      // Also check if it's a replica set or sharded cluster
      const replSetStatus = await admin.replSetGetStatus().catch(() => null);
      const isReplSet = replSetStatus !== null;
      
      return isReplSet;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking change stream support:', error);
    return false;
  }
}
