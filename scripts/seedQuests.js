// Simple script to seed sample quests into MongoDB
// Run with: node scripts/seedQuests.js

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/impactquest';

const QuestSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
    address: String,
  },
  category: String,
  impactPoints: Number,
  verificationPrompt: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

QuestSchema.index({ location: '2dsphere' });

const Quest = mongoose.models.Quest || mongoose.model('Quest', QuestSchema);

const sampleQuests = [
  {
    title: 'Beach Cleanup at Juhu',
    description: 'Help clean up the beautiful Juhu Beach. Collect trash and make our beach pristine again!',
    location: {
      type: 'Point',
      coordinates: [72.8263, 19.0896], // [longitude, latitude]
      address: 'Juhu Beach, Mumbai, Maharashtra',
    },
    category: 'cleanup',
    impactPoints: 50,
    verificationPrompt: 'A person holding a trash bag filled with collected waste on a beach',
    isActive: true,
  },
  {
    title: 'Plant Trees in Aarey Forest',
    description: 'Join us in planting native trees to restore the green lungs of Mumbai.',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.2183],
      address: 'Aarey Colony, Mumbai, Maharashtra',
    },
    category: 'planting',
    impactPoints: 75,
    verificationPrompt: 'A person planting a sapling or small tree in the ground',
    isActive: true,
  },
  {
    title: 'Recycle E-Waste Drive',
    description: 'Drop off your old electronics for proper recycling and help reduce electronic waste.',
    location: {
      type: 'Point',
      coordinates: [72.8311, 18.9388],
      address: 'Colaba, Mumbai, Maharashtra',
    },
    category: 'recycling',
    impactPoints: 40,
    verificationPrompt: 'Electronic devices or e-waste items ready for recycling',
    isActive: true,
  },
  {
    title: 'Community Garden Maintenance',
    description: 'Tend to our community garden by watering plants, removing weeds, and maintaining the space.',
    location: {
      type: 'Point',
      coordinates: [72.8479, 19.0176],
      address: 'Bandra West, Mumbai, Maharashtra',
    },
    category: 'other',
    impactPoints: 35,
    verificationPrompt: 'A person working in a garden with plants and gardening tools',
    isActive: true,
  },
  {
    title: 'Street Cleanup Initiative',
    description: 'Clean up litter from local streets and help keep our neighborhood clean.',
    location: {
      type: 'Point',
      coordinates: [72.8347, 19.1136],
      address: 'Andheri, Mumbai, Maharashtra',
    },
    category: 'cleanup',
    impactPoints: 45,
    verificationPrompt: 'Cleaned street area with collected trash or waste materials',
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing quests...');
    await Quest.deleteMany({});
    console.log('✅ Cleared existing quests');

    console.log('🌱 Seeding sample quests...');
    const createdQuests = await Quest.insertMany(sampleQuests);
    console.log(`✅ Successfully created ${createdQuests.length} quests:`);
    createdQuests.forEach((quest, index) => {
      console.log(`   ${index + 1}. ${quest.title} (+${quest.impactPoints} pts)`);
    });

    console.log('\n🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
