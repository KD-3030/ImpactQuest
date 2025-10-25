import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, Quest, Submission, RewardTransaction } from '@/models';
import realtimeManager, { REALTIME_EVENTS } from '@/lib/realtime';
import {
  calculateStage,
  calculateLevel,
  calculateQuestRewardTokens,
  calculateStageUpgradeBonus,
  calculateCreatorRewardTokens,
  getDiscountRate,
} from '@/lib/rewards';

// Mock AI verification function (replace with actual OpenAI Vision API later)
async function verifyImageWithAI(imageData: string, verificationPrompt: string): Promise<boolean> {
  // For now, return true to simulate successful verification
  // TODO: Integrate OpenAI Vision API
  console.log('Mock AI verification:', verificationPrompt);
  return true;
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

    // Calculate rewards
    const previousStage = user.stage;
    const newTotalPoints = user.totalImpactPoints + (isVerified ? quest.impactPoints : 0);
    const newStage = calculateStage(newTotalPoints);
    const newLevel = calculateLevel(newTotalPoints);
    
    // Calculate reward tokens for quest completion
    const questRewardTokens = isVerified ? calculateQuestRewardTokens(quest.impactPoints, newStage) : 0;
    
    // Calculate stage upgrade bonus
    const stageUpgradeBonus = isVerified ? calculateStageUpgradeBonus(previousStage, newStage) : 0;
    
    // Total tokens for user
    const totalUserTokens = questRewardTokens + stageUpgradeBonus;
    
    // Calculate new discount rate
    const newDiscountRate = isVerified ? getDiscountRate(newStage) : user.discountRate;

    // Create submission record
    const submission = await Submission.create({
      userId: user._id,
      questId: quest._id,
      walletAddress: walletAddress.toLowerCase(),
      imageUrl: imageData, // In production, upload to IPFS or cloud storage
      verified: isVerified,
      aiResponse: isVerified ? 'Verified successfully' : 'Verification failed',
      impactPointsEarned: isVerified ? quest.impactPoints : 0,
      rewardTokensEarned: totalUserTokens,
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

    // Update user stats if verified (MongoDB tracking + real-time events + rewards)
    if (isVerified) {
      // Update user stats
      user.totalImpactPoints = newTotalPoints;
      user.completedQuests += 1;
      user.stage = newStage;
      user.level = newLevel;
      user.rewardTokens += totalUserTokens;
      user.discountRate = newDiscountRate;
      user.totalRewardsEarned += totalUserTokens;
      user.updatedAt = new Date();
      await user.save();

      // Create reward transaction for quest completion
      if (questRewardTokens > 0) {
        await RewardTransaction.create({
          userId: user._id,
          walletAddress: walletAddress.toLowerCase(),
          type: 'quest_completion',
          amount: questRewardTokens,
          questId: quest._id,
          discountRate: newDiscountRate,
          description: `Earned ${questRewardTokens} tokens for completing quest: ${quest.title}`,
        });
      }

      // Create reward transaction for stage upgrade
      if (stageUpgradeBonus > 0) {
        await RewardTransaction.create({
          userId: user._id,
          walletAddress: walletAddress.toLowerCase(),
          type: 'stage_upgrade',
          amount: stageUpgradeBonus,
          previousStage,
          newStage,
          discountRate: newDiscountRate,
          description: `Stage upgrade bonus: ${previousStage} → ${newStage}`,
        });
      }

      // Reward quest creator if they exist
      if (quest.creatorAddress) {
        const creatorRewardTokens = calculateCreatorRewardTokens(quest.impactPoints);
        
        // Find or create creator user
        let creator = await User.findOne({ walletAddress: quest.creatorAddress.toLowerCase() });
        if (creator) {
          creator.rewardTokens += creatorRewardTokens;
          creator.totalRewardsEarned += creatorRewardTokens;
          creator.updatedAt = new Date();
          await creator.save();

          // Create reward transaction for creator
          await RewardTransaction.create({
            userId: creator._id,
            walletAddress: quest.creatorAddress.toLowerCase(),
            type: 'creator_reward',
            amount: creatorRewardTokens,
            questId: quest._id,
            description: `Creator reward for quest "${quest.title}" completion`,
          });

          // Emit real-time event for creator reward
          realtimeManager.emit('creator_rewarded', {
            creatorAddress: quest.creatorAddress.toLowerCase(),
            questId: quest._id,
            rewardTokens: creatorRewardTokens,
            timestamp: Date.now(),
          });
        }
      }

      // Update quest completion count
      quest.completionCount = (quest.completionCount || 0) + 1;
      await quest.save();

      // Emit real-time events for verification and user update
      realtimeManager.emit(REALTIME_EVENTS.SUBMISSION_VERIFIED, {
        submission: submission.toObject(),
        questId: quest._id,
        walletAddress: walletAddress.toLowerCase(),
        pointsEarned: quest.impactPoints,
        rewardTokens: totalUserTokens,
        newStage,
        newDiscountRate,
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
        rewardTokens: totalUserTokens,
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
        rewardTokens: user.rewardTokens,
        discountRate: user.discountRate,
        totalRewardsEarned: user.totalRewardsEarned,
      },
      rewards: {
        tokensEarned: totalUserTokens,
        questTokens: questRewardTokens,
        stageUpgradeBonus: stageUpgradeBonus,
        newDiscountRate: newDiscountRate,
        stageChanged: previousStage !== newStage,
        previousStage,
        newStage,
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
