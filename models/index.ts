import mongoose, { Schema, models } from 'mongoose';

// User Schema
const UserSchema = new Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  totalImpactPoints: {
    type: Number,
    default: 0,
  },
  completedQuests: {
    type: Number,
    default: 0,
  },
  stage: {
    type: String,
    enum: ['seedling', 'sprout', 'tree', 'forest'],
    default: 'seedling',
  },
  // Reward tokens for shop discounts
  rewardTokens: {
    type: Number,
    default: 0,
  },
  // Current discount rate based on stage (10-25%)
  discountRate: {
    type: Number,
    default: 10, // percentage
  },
  // Total cUSD earned from rewards
  totalRewardsEarned: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for User queries (walletAddress already indexed via unique: true)
UserSchema.index({ totalImpactPoints: -1 });
UserSchema.index({ createdAt: -1 });

// Quest Schema
const QuestSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: String,
  },
  category: {
    type: String,
    enum: ['cleanup', 'planting', 'recycling', 'education', 'other'],
    required: true,
  },
  impactPoints: {
    type: Number,
    required: true,
  },
  verificationPrompt: {
    type: String,
    required: true,
  },
  imageUrl: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active',
  },
  completionCount: {
    type: Number,
    default: 0,
  },
  maxCompletions: {
    type: Number,
    default: null, // null means unlimited
  },
  autoArchiveAfter: {
    type: Number,
    default: 86400000, // 24 hours in milliseconds (can be configured per quest)
  },
  completedAt: {
    type: Date,
    default: null,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  blockchainQuestId: {
    type: Number,
    required: false, // Optional for backward compatibility
    sparse: true,
    unique: true, // Each blockchain quest ID should be unique
  },
  // Creator/Admin wallet address who created the quest
  creatorAddress: {
    type: String,
    lowercase: true,
  },
  // Creator reward amount (5% of quest points as cUSD)
  creatorRewardAmount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

QuestSchema.index({ location: '2dsphere' });
QuestSchema.index({ status: 1 });
QuestSchema.index({ completedAt: 1 });
QuestSchema.index({ isActive: 1, status: 1 }); // Compound index for common queries
QuestSchema.index({ createdAt: -1 });
QuestSchema.index({ category: 1, isActive: 1 }); // For category filtering

// Submission Schema
const SubmissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questId: {
    type: Schema.Types.ObjectId,
    ref: 'Quest',
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  aiResponse: {
    type: String,
  },
  impactPointsEarned: {
    type: Number,
    default: 0,
  },
  // Reward tokens earned from this submission
  rewardTokensEarned: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for faster queries
SubmissionSchema.index({ userId: 1, questId: 1 });
SubmissionSchema.index({ walletAddress: 1, verified: 1 });
SubmissionSchema.index({ questId: 1, verified: 1 });
SubmissionSchema.index({ verified: 1, submittedAt: -1 }); // For admin dashboard
SubmissionSchema.index({ submittedAt: -1 }); // For sorting by date

// Reward Transaction Schema
const RewardTransactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  type: {
    type: String,
    enum: ['quest_completion', 'stage_upgrade', 'creator_reward', 'redemption'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  // For quest completions and creator rewards
  questId: {
    type: Schema.Types.ObjectId,
    ref: 'Quest',
  },
  // Previous and new stage for upgrades
  previousStage: String,
  newStage: String,
  // Discount rate at time of earning
  discountRate: Number,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Local Shop Schema
const LocalShopSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['food', 'clothing', 'electronics', 'services', 'groceries', 'other'],
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: String,
  },
  imageUrl: String,
  acceptsRewardTokens: {
    type: Boolean,
    default: true,
  },
  // Minimum stage required to redeem
  minimumStage: {
    type: String,
    enum: ['seedling', 'sprout', 'tree', 'forest'],
    default: 'seedling',
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LocalShopSchema.index({ location: '2dsphere' });

// Redemption Schema
const RedemptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  shopId: {
    type: Schema.Types.ObjectId,
    ref: 'LocalShop',
  },
  tokensRedeemed: {
    type: Number,
    required: true,
  },
  discountRate: {
    type: Number,
    required: true,
  },
  // Original purchase amount
  purchaseAmount: {
    type: Number,
    required: true,
  },
  // Discount amount in cUSD
  discountAmount: {
    type: Number,
    required: true,
  },
  // Final amount after discount
  finalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  redemptionCode: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

// Completed Quest Schema - Stores archived quests that have been completed
const CompletedQuestSchema = new Schema({
  originalQuestId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  impactPoints: {
    type: Number,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
  },
  totalCompletions: {
    type: Number,
    required: true,
  },
  completedBy: [{
    walletAddress: String,
    completedAt: Date,
    pointsEarned: Number,
  }],
  questCompletedAt: {
    type: Date,
    required: true,
  },
  archivedAt: {
    type: Date,
    default: Date.now,
  },
  questCreatedAt: {
    type: Date,
    required: true,
  },
});

CompletedQuestSchema.index({ archivedAt: -1 });
CompletedQuestSchema.index({ category: 1 });

// Export models
export const User = models.User || mongoose.model('User', UserSchema);
export const Quest = models.Quest || mongoose.model('Quest', QuestSchema);
export const Submission = models.Submission || mongoose.model('Submission', SubmissionSchema);
export const RewardTransaction = models.RewardTransaction || mongoose.model('RewardTransaction', RewardTransactionSchema);
export const LocalShop = models.LocalShop || mongoose.model('LocalShop', LocalShopSchema);
export const Redemption = models.Redemption || mongoose.model('Redemption', RedemptionSchema);
export const CompletedQuest = models.CompletedQuest || mongoose.model('CompletedQuest', CompletedQuestSchema);
