// Check if user is registered
import { createPublicClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTRACT_ABI = JSON.parse(readFileSync(join(__dirname, '../lib/contracts/ImpactQuest.json'), 'utf8'));

const CONTRACT_ADDRESS = '0xF0b27F5d830238B392D2002ADaC26E67A9A96510';
const USER_ADDRESS = '0x459841F0675b084Ec3929e3D4425652ec165F6af';

const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(),
});

async function checkUser() {
  console.log('Checking user:', USER_ADDRESS);
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('');

  // Check user profile
  try {
    const profile = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'getUserProfile',
      args: [USER_ADDRESS],
    });

    console.log('✅ User Profile Found:');
    console.log('  Is Active:', profile[0]);
    console.log('  Joined At:', new Date(Number(profile[1]) * 1000).toLocaleString());
    console.log('  Total Points:', profile[2].toString());
    console.log('  Level:', profile[3].toString());
    console.log('  Quests Completed:', profile[4].toString());
    console.log('');

    // Check token balance
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'balanceOf',
      args: [USER_ADDRESS],
    });

    const balanceInTokens = Number(balance) / 1e18;
    console.log('💰 IMP Token Balance:', balanceInTokens, 'tokens');
    console.log('');

    // Check oracle address
    const oracleAddress = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'oracleAddress',
    });

    console.log('🔐 Oracle Address in Contract:', oracleAddress);
    console.log('📍 Your Wallet Address:', USER_ADDRESS);
    console.log('');

    if (oracleAddress.toLowerCase() === USER_ADDRESS.toLowerCase()) {
      console.log('✅ Your wallet IS the oracle - Can call recordRedemption');
    } else {
      console.log('❌ Your wallet is NOT the oracle');
      console.log('   Only the oracle can call recordRedemption');
      console.log('   Contract expects:', oracleAddress);
      console.log('   You are using:', USER_ADDRESS);
    }

    console.log('');
    console.log('=== DIAGNOSIS ===');
    if (!profile[0]) {
      console.log('❌ Problem: User not registered (isActive = false)');
      console.log('   Solution: Call joinImpactQuest() from your wallet');
    } else if (balanceInTokens < 1) {
      console.log('❌ Problem: Insufficient token balance');
      console.log('   Solution: Complete more quests to earn tokens');
    } else if (oracleAddress.toLowerCase() !== USER_ADDRESS.toLowerCase()) {
      console.log('❌ Problem: Wrong oracle address');
      console.log('   Solution: Contract owner must call setOracleAddress');
    } else {
      console.log('✅ Everything looks good!');
      console.log('   The error might be something else...');
    }

  } catch (error) {
    console.error('❌ Error checking user:', error.message);
  }
}

checkUser();
