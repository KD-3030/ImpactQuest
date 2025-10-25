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
  blockchainQuestId: {
    type: Number,
    required: false, // Optional for backward compatibility
    sparse: true,
    unique: true, // Each blockchain quest ID should be unique
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

QuestSchema.index({ location: '2dsphere' });

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

// Export models
export const User = models.User || mongoose.model('User', UserSchema);
export const Quest = models.Quest || mongoose.model('Quest', QuestSchema);
export const Submission = models.Submission || mongoose.model('Submission', SubmissionSchema);
