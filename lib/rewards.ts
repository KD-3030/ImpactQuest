/**
 * Reward Calculation Utilities
 * 
 * Handles all reward calculations for the ImpactQuest platform:
 * - User rewards based on stage progression
 * - Quest creator rewards
 * - Discount rate calculations
 * - Token distribution logic
 */

// Stage-based reward configuration
export const STAGE_REWARDS = {
  seedling: {
    discountRate: 10, // 10% discount
    tokensPerQuest: 1, // 1 token per quest
    upgradeBonus: 0, // No bonus for seedling
  },
  sprout: {
    discountRate: 15, // 15% discount
    tokensPerQuest: 2, // 2 tokens per quest
    upgradeBonus: 10, // 10 tokens for reaching sprout
  },
  tree: {
    discountRate: 20, // 20% discount
    tokensPerQuest: 3, // 3 tokens per quest
    upgradeBonus: 20, // 20 tokens for reaching tree
  },
  forest: {
    discountRate: 25, // 25% discount
    tokensPerQuest: 5, // 5 tokens per quest
    upgradeBonus: 50, // 50 tokens for reaching forest
  },
};

// Creator reward configuration
export const CREATOR_REWARD_CONFIG = {
  percentageOfQuestPoints: 5, // Creator gets 5% of quest impact points as reward tokens
  minimumReward: 1, // Minimum 1 token per quest completion
  maximumReward: 10, // Maximum 10 tokens per quest completion
};

/**
 * Calculate stage based on impact points
 */
export function calculateStage(points: number): string {
  if (points >= 600) return 'forest';
  if (points >= 300) return 'tree';
  if (points >= 100) return 'sprout';
  return 'seedling';
}

/**
 * Calculate level based on impact points
 */
export function calculateLevel(points: number): number {
  return Math.floor(points / 50) + 1;
}

/**
 * Get discount rate for a stage
 */
export function getDiscountRate(stage: string): number {
  return STAGE_REWARDS[stage as keyof typeof STAGE_REWARDS]?.discountRate || 10;
}

/**
 * Calculate reward tokens for completing a quest
 */
export function calculateQuestRewardTokens(
  questPoints: number,
  userStage: string
): number {
  const baseTokens = STAGE_REWARDS[userStage as keyof typeof STAGE_REWARDS]?.tokensPerQuest || 1;
  
  // Bonus tokens for high-impact quests (50+ points)
  const highImpactBonus = questPoints >= 50 ? Math.floor(questPoints / 50) : 0;
  
  return baseTokens + highImpactBonus;
}

/**
 * Calculate stage upgrade bonus tokens
 * Returns 0 if no stage change, otherwise returns bonus amount
 */
export function calculateStageUpgradeBonus(
  previousStage: string,
  newStage: string
): number {
  if (previousStage === newStage) return 0;
  
  return STAGE_REWARDS[newStage as keyof typeof STAGE_REWARDS]?.upgradeBonus || 0;
}

/**
 * Calculate creator reward tokens
 */
export function calculateCreatorRewardTokens(questPoints: number): number {
  const reward = Math.floor(
    (questPoints * CREATOR_REWARD_CONFIG.percentageOfQuestPoints) / 100
  );
  
  // Apply min/max constraints
  return Math.max(
    CREATOR_REWARD_CONFIG.minimumReward,
    Math.min(reward, CREATOR_REWARD_CONFIG.maximumReward)
  );
}

/**
 * Calculate discount amount in cUSD
 */
export function calculateDiscountAmount(
  purchaseAmount: number,
  discountRate: number
): number {
  return (purchaseAmount * discountRate) / 100;
}

/**
 * Calculate final amount after discount
 */
export function calculateFinalAmount(
  purchaseAmount: number,
  discountRate: number
): number {
  const discount = calculateDiscountAmount(purchaseAmount, discountRate);
  return purchaseAmount - discount;
}

/**
 * Calculate tokens required for a specific discount
 * Each token represents 1 cUSD value
 */
export function calculateTokensForPurchase(
  purchaseAmount: number,
  discountRate: number
): number {
  const discountAmount = calculateDiscountAmount(purchaseAmount, discountRate);
  // Each token is worth 1 cUSD of discount
  return Math.ceil(discountAmount);
}

/**
 * Validate if user has enough tokens for redemption
 */
export function canRedeemTokens(
  userTokens: number,
  requiredTokens: number
): boolean {
  return userTokens >= requiredTokens;
}

/**
 * Generate unique redemption code
 */
export function generateRedemptionCode(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RDM-${timestamp}-${randomStr}`;
}

/**
 * Calculate total rewards summary for a user
 */
export interface RewardsSummary {
  stage: string;
  discountRate: number;
  rewardTokens: number;
  tokensPerQuest: number;
  nextStageAt: number;
  nextStageTokens: number;
  totalRewardsEarned: number;
}

export function calculateRewardsSummary(
  currentPoints: number,
  rewardTokens: number,
  totalRewardsEarned: number
): RewardsSummary {
  const stage = calculateStage(currentPoints);
  const discountRate = getDiscountRate(stage);
  const tokensPerQuest = STAGE_REWARDS[stage as keyof typeof STAGE_REWARDS]?.tokensPerQuest || 1;
  
  // Calculate points needed for next stage
  let nextStageAt = 0;
  let nextStageTokens = 0;
  
  if (stage === 'seedling') {
    nextStageAt = 100;
    nextStageTokens = STAGE_REWARDS.sprout.upgradeBonus;
  } else if (stage === 'sprout') {
    nextStageAt = 300;
    nextStageTokens = STAGE_REWARDS.tree.upgradeBonus;
  } else if (stage === 'tree') {
    nextStageAt = 600;
    nextStageTokens = STAGE_REWARDS.forest.upgradeBonus;
  } else {
    nextStageAt = currentPoints; // Already at max stage
    nextStageTokens = 0;
  }
  
  return {
    stage,
    discountRate,
    rewardTokens,
    tokensPerQuest,
    nextStageAt,
    nextStageTokens,
    totalRewardsEarned,
  };
}

/**
 * Format cUSD amount for display
 */
export function formatCUSD(amount: number): string {
  return `${amount.toFixed(2)} cUSD`;
}

/**
 * Format discount rate for display
 */
export function formatDiscountRate(rate: number): string {
  return `${rate}%`;
}
