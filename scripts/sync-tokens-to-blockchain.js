const mongoose = require('mongoose');
const fetch = require('node-fetch');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kinjaldutta005_db_user:bBykORwo3116pI1w@cluster0.afuveai.mongodb.net/?appName=Cluster0';
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  rewardTokens: { type: Number, default: 0 },
  discountRate: { type: Number, default: 0 },
  stage: { type: String, default: 'seedling' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function syncTokensToBlockchain() {
  try {
    console.log('🔄 Starting token sync from MongoDB to Blockchain...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users with tokens
    const users = await User.find({ rewardTokens: { $gt: 0 } });
    console.log(`📊 Found ${users.length} users with tokens\n`);

    if (users.length === 0) {
      console.log('ℹ️  No users with tokens to sync');
      return;
    }

    // Sync each user
    for (const user of users) {
      console.log(`\n👤 User: ${user.walletAddress}`);
      console.log(`   MongoDB Tokens: ${user.rewardTokens}`);
      console.log(`   Stage: ${user.stage}`);
      console.log(`   Discount: ${user.discountRate}%`);
      
      try {
        // Call oracle to mint tokens
        const response = await fetch(`${API_URL}/api/oracle/mint-tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAddress: user.walletAddress,
            amount: user.rewardTokens,
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log(`   ✅ Minted ${user.rewardTokens} tokens`);
          console.log(`   📝 Transaction: ${result.transactionHash}`);
          console.log(`   🔗 View: https://alfajores.celoscan.io/tx/${result.transactionHash}`);
        } else {
          console.log(`   ❌ Failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      // Wait a bit between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n✅ Token sync completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the sync
syncTokensToBlockchain();
