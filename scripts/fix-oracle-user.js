/**
 * Fix Oracle Wallet User Issue
 * 
 * Problem: A user exists in MongoDB with the oracle wallet address
 * Solution: Delete or update this user so real users can connect properly
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ORACLE_ADDRESS = '0x459841F0675b084Ec3929e3D4425652ec165F6af';

async function fixOracleUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema (simplified)
    const userSchema = new mongoose.Schema({
      walletAddress: String,
      username: String,
      email: String,
      rewardTokens: Number,
      stage: String,
      role: String,
    }, { collection: 'users' });

    const User = mongoose.model('User', userSchema);

    // Find user with oracle address
    const oracleUser = await User.findOne({ 
      walletAddress: ORACLE_ADDRESS.toLowerCase() 
    });

    if (!oracleUser) {
      console.log('✅ No user found with oracle wallet address. You\'re good to go!');
      console.log('\nNext steps:');
      console.log('1. Connect your MetaMask wallet to the app');
      console.log('2. Make sure you\'re on Celo Sepolia network');
      console.log('3. Your wallet address will be registered automatically');
      process.exit(0);
    }

    console.log('\n❌ Found user with oracle wallet address:');
    console.log('User ID:', oracleUser._id);
    console.log('Username:', oracleUser.username);
    console.log('Email:', oracleUser.email);
    console.log('Reward Tokens:', oracleUser.rewardTokens);
    console.log('Stage:', oracleUser.stage);
    console.log('Role:', oracleUser.role);

    // Delete the oracle user
    await User.deleteOne({ _id: oracleUser._id });
    console.log('\n✅ Deleted user with oracle wallet address');

    console.log('\n🎉 Fixed! Now you can:');
    console.log('1. Go to http://localhost:3000');
    console.log('2. Click "Connect Wallet"');
    console.log('3. Connect with YOUR MetaMask wallet');
    console.log('4. Your actual wallet address will be used');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

fixOracleUser();
