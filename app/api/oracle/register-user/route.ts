import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import CONTRACT_ABI from '@/lib/contracts/ImpactQuest.json';

// Oracle wallet configuration
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY as `0x${string}`;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// Validate environment variables
if (!ORACLE_PRIVATE_KEY) {
  console.error('ORACLE_PRIVATE_KEY not set in environment variables');
}

if (!CONTRACT_ADDRESS) {
  console.error('NEXT_PUBLIC_CONTRACT_ADDRESS not set in environment variables');
}

/**
 * Oracle service that registers users on blockchain
 * This is needed because the user calls joinImpactQuest themselves
 * But if they haven't, we can help them register through the oracle
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment
    if (!ORACLE_PRIVATE_KEY || !CONTRACT_ADDRESS) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Oracle service not configured. Check ORACLE_PRIVATE_KEY and CONTRACT_ADDRESS in .env.local' 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userAddress } = body;

    // Validate required fields
    if (!userAddress) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: userAddress' 
        },
        { status: 400 }
      );
    }

    console.log('Checking if user is registered:', userAddress);

    // Create public client for reading blockchain data
    const publicClient = createPublicClient({
      chain: celoAlfajores,
      transport: http(),
    });

    // Check if user is already registered
    const userProfile = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'userProfiles',
      args: [userAddress],
    }) as any[];

    const isActive = userProfile[5]; // isActive is the 6th field (index 5)

    if (isActive) {
      return NextResponse.json({
        success: true,
        message: 'User already registered',
        userAddress,
        alreadyRegistered: true,
      });
    }

    console.log('User not registered, registering now...');

    // Create oracle wallet client
    const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: celoAlfajores,
      transport: http(),
    });

    // IMPORTANT: Users should call joinImpactQuest themselves from frontend
    // But since the contract requires oracle to call most functions,
    // we need to register them through a special flow
    
    // Option 1: If contract has an oracle-callable registration function
    // Option 2: Have user call joinImpactQuest from frontend first
    
    // For now, let's return instructions for the user
    return NextResponse.json({
      success: false,
      error: 'User not registered on blockchain',
      userAddress,
      instructions: {
        message: 'Please register on the blockchain first by calling joinImpactQuest from your wallet',
        action: 'call_from_frontend',
        function: 'joinImpactQuest',
        contract: CONTRACT_ADDRESS,
      },
      // Provide the transaction data for frontend to call
      registrationNeeded: true,
    }, { status: 400 });

  } catch (error: any) {
    console.error('Oracle registration check error:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if user is registered
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'userAddress parameter required' },
        { status: 400 }
      );
    }

    // Create public client
    const publicClient = createPublicClient({
      chain: celoAlfajores,
      transport: http(),
    });

    // Check registration status
    const userProfile = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'userProfiles',
      args: [userAddress],
    }) as any[];

    const [level, totalImpactScore, questsCompleted, lastQuestTimestamp, joinedTimestamp, isActive] = userProfile;

    return NextResponse.json({
      success: true,
      userAddress,
      isRegistered: isActive,
      profile: isActive ? {
        level: Number(level),
        totalImpactScore: Number(totalImpactScore),
        questsCompleted: Number(questsCompleted),
        lastQuestTimestamp: Number(lastQuestTimestamp),
        joinedTimestamp: Number(joinedTimestamp),
      } : null,
    });

  } catch (error: any) {
    console.error('Error checking registration:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
