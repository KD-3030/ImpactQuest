// lib/blockchain.ts
import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther } from 'viem';
import { celoAlfajores } from 'viem/chains';
import ImpactQuestABI from './contracts/ImpactQuest.json';

// Get contract address from environment variable
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

if (!CONTRACT_ADDRESS) {
  console.warn('⚠️ NEXT_PUBLIC_CONTRACT_ADDRESS is not set in .env.local');
}

// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http('https://alfajores-forno.celo-testnet.org')
});

// Get wallet client from browser wallet (MetaMask/RainbowKit)
export function getWalletClient() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet detected');
  }

  return createWalletClient({
    chain: celoAlfajores,
    transport: custom(window.ethereum)
  });
}

// ============ Read Functions ============

/**
 * Get user profile from blockchain
 */
export async function getUserProfile(address: string) {
  try {
    const data = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ImpactQuestABI.abi,
      functionName: 'userProfiles',
      args: [address]
    });

    // Parse the returned tuple
    const [level, totalImpactScore, questsCompleted, lastQuestTimestamp, joinedTimestamp, isActive] = data as any[];

    return {
      level: Number(level),
      totalImpactScore: Number(totalImpactScore),
      questsCompleted: Number(questsCompleted),
      lastQuestTimestamp: Number(lastQuestTimestamp),
      joinedTimestamp: Number(joinedTimestamp),
      isActive: Boolean(isActive)
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Get user's IMP token balance
 */
export async function getTokenBalance(address: string): Promise<string> {
  try {
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ImpactQuestABI.abi,
      functionName: 'balanceOf',
      args: [address]
    });

    return formatEther(balance as bigint);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
}

/**
 * Get quest details from blockchain
 */
export async function getQuest(questId: number) {
  try {
    const quest = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ImpactQuestABI.abi,
      functionName: 'quests',
      args: [BigInt(questId)]
    });

    const [id, name, description, rewardAmount, impactScore, isActive, cooldownPeriod, category] = quest as any[];

    return {
      id: Number(id),
      name,
      description,
      rewardAmount: formatEther(rewardAmount),
      impactScore: Number(impactScore),
      isActive: Boolean(isActive),
      cooldownPeriod: Number(cooldownPeriod),
      category: Number(category)
    };
  } catch (error) {
    console.error('Error getting quest:', error);
    return null;
  }
}

/**
 * Check if user has completed a specific quest
 */
export async function hasCompletedQuest(userAddress: string, questId: number): Promise<boolean> {
  try {
    const lastCompletionTime = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ImpactQuestABI.abi,
      functionName: 'lastQuestCompletionTime',
      args: [userAddress, BigInt(questId)]
    });

    return Number(lastCompletionTime) > 0;
  } catch (error) {
    console.error('Error checking quest completion:', error);
    return false;
  }
}

// ============ Write Functions (Require Wallet) ============

/**
 * Join the ImpactQuest platform (first-time user registration)
 */
export async function joinPlatform(walletClient: any) {
  try {
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ImpactQuestABI.abi,
      functionName: 'joinImpactQuest', // Updated to match actual contract function name
      account: walletClient.account,
      chain: celoAlfajores
    });

    const hash = await walletClient.writeContract(request);
    
    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    return {
      success: true,
      transactionHash: hash,
      receipt
    };
  } catch (error: any) {
    console.error('Error joining platform:', error);
    
    // Check if user is already registered
    if (error.message?.includes('User already registered')) {
      return {
        success: false,
        error: 'User already registered',
        alreadyRegistered: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check if user is registered on blockchain
 */
export async function isUserRegistered(address: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(address);
    return profile?.isActive || false;
  } catch (error) {
    console.error('Error checking registration:', error);
    return false;
  }
}

/**
 * Complete a quest (called by backend oracle after AI verification)
 * Note: This is typically called by the backend, not directly by users
 */
export async function completeQuestOnChain(
  questId: number,
  userAddress: string,
  proofHash: string,
  walletClient: any
) {
  try {
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ImpactQuestABI.abi,
      functionName: 'completeQuest',
      args: [BigInt(questId), userAddress as `0x${string}`, proofHash as `0x${string}`],
      account: walletClient.account,
      chain: celoAlfajores
    });

    const hash = await walletClient.writeContract(request);
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    return {
      success: true,
      transactionHash: hash,
      receipt
    };
  } catch (error: any) {
    console.error('Error completing quest:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all quest IDs (for admin)
 */
export async function getNextQuestId(): Promise<number> {
  try {
    const nextId = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ImpactQuestABI.abi,
      functionName: 'nextQuestId'
    });

    return Number(nextId);
  } catch (error) {
    console.error('Error getting next quest ID:', error);
    return 1;
  }
}

/**
 * Get level name from level number
 */
export function getLevelName(level: number): string {
  const levels = ['None', 'Seedling', 'Sprout', 'Sapling', 'Tree'];
  return levels[level] || 'Unknown';
}

/**
 * Get category name from category number
 */
export function getCategoryName(category: number): string {
  const categories = [
    'Environmental',
    'Community Service',
    'Education',
    'Waste Reduction',
    'Sustainability'
  ];
  return categories[category] || 'Other';
}

// Export contract address for use in other files
export { CONTRACT_ADDRESS };
