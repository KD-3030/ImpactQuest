// Script to verify seeded test data
// Run with: node scripts/verifyTestData.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Define Schemas (use strict: false to read any fields)
const QuestSchema = new mongoose.Schema({}, { collection: 'quests', strict: false });
const LocalShopSchema = new mongoose.Schema({}, { collection: 'localshops', strict: false });
const RedemptionSchema = new mongoose.Schema({}, { collection: 'redemptions', strict: false });
const UserSchema = new mongoose.Schema({}, { collection: 'users', strict: false });

const Quest = mongoose.models.Quest || mongoose.model('Quest', QuestSchema);
const LocalShop = mongoose.models.LocalShop || mongoose.model('LocalShop', LocalShopSchema);
const Redemption = mongoose.models.Redemption || mongoose.model('Redemption', RedemptionSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function verifyData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count quests
    const questCount = await Quest.countDocuments();
    console.log(`📍 Quests: ${questCount}`);
    
    if (questCount > 0) {
      const quests = await Quest.find().limit(3).lean();
      quests.forEach((quest, i) => {
        console.log(`   ${i + 1}. ${quest.title} (+${quest.impactPoints} pts)`);
        console.log(`      📍 ${quest.location?.address || 'No address'}`);
      });
      if (questCount > 3) {
        console.log(`   ... and ${questCount - 3} more\n`);
      } else {
        console.log('');
      }
    }

    // Count local shops
    const shopCount = await LocalShop.countDocuments();
    console.log(`🏪 Local Shops: ${shopCount}`);
    
    if (shopCount > 0) {
      const shops = await LocalShop.find().limit(3).lean();
      shops.forEach((shop, i) => {
        console.log(`   ${i + 1}. ${shop.name} (${shop.category})`);
        console.log(`      📍 ${shop.location?.address || 'No address'}`);
      });
      if (shopCount > 3) {
        console.log(`   ... and ${shopCount - 3} more\n`);
      } else {
        console.log('');
      }
    }

    // Count redemptions
    const redemptionCount = await Redemption.countDocuments();
    console.log(`🎟️  Redemptions: ${redemptionCount}`);
    
    if (redemptionCount > 0) {
      const redemptions = await Redemption.find().lean();
      redemptions.forEach((redemption, i) => {
        console.log(`   ${i + 1}. ${redemption.tokensRedeemed || 0} tokens - ${redemption.status} - ${redemption.redemptionCode}`);
      });
      console.log('');
    }

    // Count users
    const userCount = await User.countDocuments();
    console.log(`👤 Users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().limit(5).lean();
      users.forEach((user, i) => {
        const wallet = user.walletAddress || 'unknown';
        console.log(`   ${i + 1}. ${wallet.substring(0, 10)}...`);
        console.log(`      💎 ${user.impactPoints || 0} pts | 🎫 ${user.rewardTokens || 0} tokens | ${user.currentStage || 'seedling'}`);
      });
      if (userCount > 5) {
        console.log(`   ... and ${userCount - 5} more\n`);
      } else {
        console.log('');
      }
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total Documents: ${questCount + shopCount + redemptionCount + userCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (questCount === 0 && shopCount === 0) {
      console.log('\n⚠️  Warning: No test data found!');
      console.log('💡 Run: node scripts/seedTestData.js');
    } else {
      console.log('\n✅ Test data verification complete!');
      console.log('\n🌐 Visit these pages to view the data:');
      console.log('   • Quest Hub: http://localhost:3000/quest-hub');
      console.log('   • Dashboard: http://localhost:3000/dashboard');
      console.log('   • Admin: http://localhost:3000/admin/dashboard');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying data:', error.message);
    process.exit(1);
  }
}

verifyData();
