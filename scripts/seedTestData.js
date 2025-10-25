// Comprehensive script to seed test data for Quests, LocalShops, and Redemptions
// Run with: node scripts/seedTestData.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/impactquest';

// Define Schemas (matching models/index.ts)
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
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const LocalShopSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: {
    type: String,
    enum: ['food', 'clothing', 'electronics', 'services', 'groceries', 'other'],
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number],
    address: String,
  },
  imageUrl: String,
  acceptsRewardTokens: { type: Boolean, default: true },
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
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true, lowercase: true },
  impactPoints: { type: Number, default: 0 },
  totalImpactPoints: { type: Number, default: 0 },
  rewardTokens: { type: Number, default: 0 },
  currentStage: {
    type: String,
    enum: ['seedling', 'sprout', 'tree', 'forest'],
    default: 'seedling',
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const RedemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletAddress: { type: String, required: true, lowercase: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'LocalShop' },
  tokensRedeemed: Number,
  discountRate: Number,
  purchaseAmount: Number,
  discountAmount: Number,
  finalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  redemptionCode: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

QuestSchema.index({ location: '2dsphere' });
LocalShopSchema.index({ location: '2dsphere' });

const Quest = mongoose.models.Quest || mongoose.model('Quest', QuestSchema);
const LocalShop = mongoose.models.LocalShop || mongoose.model('LocalShop', LocalShopSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Redemption = mongoose.models.Redemption || mongoose.model('Redemption', RedemptionSchema);

// Center location: Mumbai, Maharashtra (adjust to your actual location)
// Format: [longitude, latitude]
const CENTER_LOCATION = [72.8777, 19.0760]; // Mumbai center

// Helper function to generate nearby coordinates
function generateNearbyCoordinates(centerLng, centerLat, radiusKm) {
  const radiusInDegrees = radiusKm / 111; // Rough conversion
  const randomLng = centerLng + (Math.random() - 0.5) * 2 * radiusInDegrees;
  const randomLat = centerLat + (Math.random() - 0.5) * 2 * radiusInDegrees;
  return [randomLng, randomLat];
}

// Sample Quests near your location
const sampleQuests = [
  {
    title: 'Beach Cleanup at Juhu Beach',
    description: 'Help clean up the beautiful Juhu Beach. Collect trash and make our beach pristine again! Perfect for weekend warriors.',
    location: {
      type: 'Point',
      coordinates: [72.8263, 19.0896],
      address: 'Juhu Beach, Juhu, Mumbai, Maharashtra 400049',
    },
    category: 'cleanup',
    impactPoints: 50,
    verificationPrompt: 'A person holding a trash bag filled with collected waste on a beach',
    isActive: true,
    status: 'active',
  },
  {
    title: 'Plant Trees at Sanjay Gandhi National Park',
    description: 'Join us in planting native trees to restore the green lungs of Mumbai. All tools and saplings provided.',
    location: {
      type: 'Point',
      coordinates: [72.9147, 19.2183],
      address: 'Sanjay Gandhi National Park, Borivali East, Mumbai, Maharashtra 400066',
    },
    category: 'planting',
    impactPoints: 75,
    verificationPrompt: 'A person planting a sapling or small tree in the ground',
    isActive: true,
    status: 'active',
  },
  {
    title: 'E-Waste Recycling Drive - Colaba',
    description: 'Drop off your old electronics for proper recycling. Help reduce electronic waste and protect our environment.',
    location: {
      type: 'Point',
      coordinates: [72.8311, 18.9388],
      address: 'Colaba Causeway, Colaba, Mumbai, Maharashtra 400005',
    },
    category: 'recycling',
    impactPoints: 40,
    verificationPrompt: 'Electronic devices or e-waste items ready for recycling',
    isActive: true,
    status: 'active',
  },
  {
    title: 'Community Garden Care - Bandra',
    description: 'Tend to our community garden by watering plants, removing weeds, and maintaining the space. Great for families!',
    location: {
      type: 'Point',
      coordinates: [72.8479, 19.0596],
      address: 'Bandra West, Mumbai, Maharashtra 400050',
    },
    category: 'other',
    impactPoints: 35,
    verificationPrompt: 'A person working in a garden with plants and gardening tools',
    isActive: true,
    status: 'active',
  },
  {
    title: 'Street Cleanup - Andheri West',
    description: 'Clean up litter from local streets and help keep our neighborhood sparkling clean. Every bit helps!',
    location: {
      type: 'Point',
      coordinates: [72.8347, 19.1136],
      address: 'Andheri West, Mumbai, Maharashtra 400053',
    },
    category: 'cleanup',
    impactPoints: 45,
    verificationPrompt: 'Cleaned street area with collected trash or waste materials',
    isActive: true,
    status: 'active',
  },
  {
    title: 'Plastic-Free Market Initiative',
    description: 'Help promote and set up plastic-free shopping at local markets. Educate vendors and shoppers.',
    location: {
      type: 'Point',
      coordinates: [72.8561, 19.0748],
      address: 'Dadar West, Mumbai, Maharashtra 400028',
    },
    category: 'recycling',
    impactPoints: 60,
    verificationPrompt: 'Person promoting reusable bags or plastic-free alternatives at a market',
    isActive: true,
    status: 'active',
  },
  {
    title: 'Mangrove Restoration - Mahim Creek',
    description: 'Join our mangrove restoration project. Plant mangroves to protect coastal ecosystems and biodiversity.',
    location: {
      type: 'Point',
      coordinates: [72.8406, 19.0383],
      address: 'Mahim Creek, Mahim, Mumbai, Maharashtra 400016',
    },
    category: 'planting',
    impactPoints: 80,
    verificationPrompt: 'Person planting mangrove saplings in coastal area',
    isActive: true,
    status: 'active',
  },
  {
    title: 'School Garden Workshop - Powai',
    description: 'Teach students about sustainable gardening. Help set up a school garden and inspire the next generation.',
    location: {
      type: 'Point',
      coordinates: [72.9047, 19.1176],
      address: 'Powai, Mumbai, Maharashtra 400076',
    },
    category: 'other',
    impactPoints: 55,
    verificationPrompt: 'Person teaching or working with students in a school garden',
    isActive: true,
    status: 'active',
  },
];

// Sample Local Shops near your location
const sampleShops = [
  {
    name: 'Green Earth Café',
    description: 'Organic café serving healthy meals with locally sourced ingredients. Accepts reward tokens for discounts!',
    category: 'food',
    location: {
      type: 'Point',
      coordinates: [72.8377, 19.0760],
      address: 'Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    },
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    acceptsRewardTokens: true,
    minimumStage: 'seedling',
    contactInfo: {
      phone: '+91 22 2640 1234',
      email: 'hello@greenearthcafe.com',
      website: 'https://greenearthcafe.com',
    },
    isActive: true,
  },
  {
    name: 'EcoWear Fashion',
    description: 'Sustainable clothing made from organic and recycled materials. Fashion that cares for the planet.',
    category: 'clothing',
    location: {
      type: 'Point',
      coordinates: [72.8265, 19.0896],
      address: 'Juhu Tara Road, Juhu, Mumbai, Maharashtra 400049',
    },
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400',
    acceptsRewardTokens: true,
    minimumStage: 'sprout',
    contactInfo: {
      phone: '+91 22 2660 5678',
      email: 'info@ecowear.in',
      website: 'https://ecowear.in',
    },
    isActive: true,
  },
  {
    name: 'Tech Recycle Hub',
    description: 'Certified e-waste recycling center. Trade in old electronics for store credit. Responsible disposal guaranteed.',
    category: 'electronics',
    location: {
      type: 'Point',
      coordinates: [72.8347, 19.1176],
      address: 'Veera Desai Road, Andheri West, Mumbai, Maharashtra 400053',
    },
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400',
    acceptsRewardTokens: true,
    minimumStage: 'seedling',
    contactInfo: {
      phone: '+91 22 2673 9012',
      email: 'recycle@techhub.in',
      website: 'https://techrecyclehub.in',
    },
    isActive: true,
  },
  {
    name: 'Nature\'s Basket Organic',
    description: 'Premium organic groceries and fresh produce. Supporting local farmers and sustainable agriculture.',
    category: 'groceries',
    location: {
      type: 'Point',
      coordinates: [72.8561, 19.0748],
      address: 'Shivaji Park, Dadar West, Mumbai, Maharashtra 400028',
    },
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    acceptsRewardTokens: true,
    minimumStage: 'seedling',
    contactInfo: {
      phone: '+91 22 2444 1234',
      email: 'shop@naturesbasket.in',
      website: 'https://naturesbasket.in',
    },
    isActive: true,
  },
  {
    name: 'Green Clean Services',
    description: 'Eco-friendly cleaning services using biodegradable products. Professional home and office cleaning.',
    category: 'services',
    location: {
      type: 'Point',
      coordinates: [72.8479, 19.0596],
      address: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    },
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    acceptsRewardTokens: true,
    minimumStage: 'sprout',
    contactInfo: {
      phone: '+91 22 2651 7890',
      email: 'book@greenclean.in',
      website: 'https://greenclean.in',
    },
    isActive: true,
  },
  {
    name: 'Recycle & Repair Workshop',
    description: 'Repair services for electronics, furniture, and more. Extending product life and reducing waste.',
    category: 'services',
    location: {
      type: 'Point',
      coordinates: [72.9047, 19.1176],
      address: 'Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076',
    },
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    acceptsRewardTokens: true,
    minimumStage: 'seedling',
    contactInfo: {
      phone: '+91 22 2570 3456',
      email: 'repair@recycleworkshop.in',
      website: 'https://recycleworkshop.in',
    },
    isActive: true,
  },
];

// Generate a random redemption code
function generateRedemptionCode() {
  return 'RDM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Quest.deleteMany({});
    await LocalShop.deleteMany({});
    await Redemption.deleteMany({});
    console.log('✅ Cleared all existing data');

    // Seed Quests
    console.log('\n🌱 Seeding Quests...');
    const createdQuests = await Quest.insertMany(sampleQuests);
    console.log(`✅ Successfully created ${createdQuests.length} quests:`);
    createdQuests.forEach((quest, index) => {
      console.log(`   ${index + 1}. ${quest.title} (+${quest.impactPoints} pts) - ${quest.location.address}`);
    });

    // Seed Local Shops
    console.log('\n🏪 Seeding Local Shops...');
    const createdShops = await LocalShop.insertMany(sampleShops);
    console.log(`✅ Successfully created ${createdShops.length} local shops:`);
    createdShops.forEach((shop, index) => {
      console.log(`   ${index + 1}. ${shop.name} (${shop.category}) - ${shop.location.address}`);
    });

    // Check if test users exist, if not create them
    console.log('\n👤 Checking for test users...');
    let testUser = await User.findOne({ walletAddress: '0x1234567890123456789012345678901234567890' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        walletAddress: '0x1234567890123456789012345678901234567890',
        impactPoints: 250,
        totalImpactPoints: 500,
        rewardTokens: 50,
        currentStage: 'sprout',
        role: 'user',
      });
      console.log('✅ Created test user');
    } else {
      console.log('✅ Test user already exists');
    }

    // Seed Redemptions
    console.log('\n🎟️  Seeding Redemptions...');
    const sampleRedemptions = [
      {
        userId: testUser._id,
        walletAddress: testUser.walletAddress,
        shopId: createdShops[0]._id, // Green Earth Café
        tokensRedeemed: 10,
        discountRate: 0.1, // 10% discount
        purchaseAmount: 500,
        discountAmount: 50,
        finalAmount: 450,
        status: 'completed',
        redemptionCode: generateRedemptionCode(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        walletAddress: testUser.walletAddress,
        shopId: createdShops[3]._id, // Nature's Basket Organic
        tokensRedeemed: 15,
        discountRate: 0.1,
        purchaseAmount: 800,
        discountAmount: 80,
        finalAmount: 720,
        status: 'completed',
        redemptionCode: generateRedemptionCode(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: testUser._id,
        walletAddress: testUser.walletAddress,
        shopId: createdShops[1]._id, // EcoWear Fashion
        tokensRedeemed: 20,
        discountRate: 0.15, // 15% discount for sprout level
        purchaseAmount: 1200,
        discountAmount: 180,
        finalAmount: 1020,
        status: 'pending',
        redemptionCode: generateRedemptionCode(),
        createdAt: new Date(),
      },
    ];

    const createdRedemptions = await Redemption.insertMany(sampleRedemptions);
    console.log(`✅ Successfully created ${createdRedemptions.length} redemptions:`);
    createdRedemptions.forEach((redemption, index) => {
      console.log(`   ${index + 1}. ${redemption.tokensRedeemed} tokens - ${redemption.status} - Code: ${redemption.redemptionCode}`);
    });

    console.log('\n📊 Database Summary:');
    console.log(`   Quests: ${createdQuests.length}`);
    console.log(`   Local Shops: ${createdShops.length}`);
    console.log(`   Redemptions: ${createdRedemptions.length}`);
    console.log(`   Test Users: 1`);

    console.log('\n🎉 Database seeding complete!');
    console.log('\n💡 Tips:');
    console.log('   - All quests are near Mumbai, Maharashtra');
    console.log('   - All shops accept reward tokens');
    console.log('   - Test user has 250 impact points and 50 reward tokens');
    console.log('   - Visit http://localhost:3000/quest-hub to see quests on the map');
    console.log('   - Visit http://localhost:3000/dashboard to see your rewards');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
