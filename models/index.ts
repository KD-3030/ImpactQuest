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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

QuestSchema.index({ location: '2dsphere' });
QuestSchema.index({ status: 1 });
QuestSchema.index({ completedAt: 1 });

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
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for faster queries
SubmissionSchema.index({ userId: 1, questId: 1 });
SubmissionSchema.index({ walletAddress: 1, verified: 1 });
SubmissionSchema.index({ questId: 1, verified: 1 });

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
export const CompletedQuest = models.CompletedQuest || mongoose.model('CompletedQuest', CompletedQuestSchema);
