import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, keccak256, toHex } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import CONTRACT_ABI from '@/contracts/artifacts/contracts/ImpactQuest.sol/ImpactQuest.json';

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
 * Oracle service that verifies AI proof and mints tokens
 * This endpoint should be called internally from submit-proof API
 * after AI verification succeeds
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
    const { userAddress, questId, proofData } = body;

    // Validate required fields
    if (!userAddress || questId === undefined || !proofData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userAddress, questId, proofData' 
        },
        { status: 400 }
      );
    }

    // Validate blockchain quest ID
    if (typeof questId !== 'number' || questId <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid questId. Must be a positive number corresponding to blockchain quest ID' 
        },
        { status: 400 }
      );
    }

    // Create proof hash from verification data
    // This hash serves as a unique identifier for this specific quest completion
    const proofHash = keccak256(
      toHex(JSON.stringify({
        userAddress,
        questId,
        timestamp: Date.now(),
        proofData: proofData.substring(0, 100), // Use first 100 chars to keep hash consistent
      }))
    ) as `0x${string}`;

    console.log('Oracle processing:', { userAddress, questId, proofHash });

    // Create public client for reading blockchain data
    const publicClient = createPublicClient({
      chain: celoAlfajores,
      transport: http(),
    });

    // Create oracle wallet client
    const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: celoAlfajores,
      transport: http(),
    });

    // Call smart contract completeQuest function
    // This mints tokens to the user if all validations pass
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'completeQuest',
      args: [userAddress, BigInt(questId), proofHash],
    });

    console.log('Transaction sent:', hash);

    // Wait for transaction confirmation using public client
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      confirmations: 1, // Wait for 1 confirmation
    });

    console.log('Transaction confirmed:', receipt);

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      proofHash,
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
      gasUsed: receipt.gasUsed.toString(),
    });

  } catch (error: any) {
    console.error('Oracle error:', error);

    // Parse contract revert errors
    let errorMessage = error.message;
    
    if (error.message.includes('Quest cooldown not expired')) {
      errorMessage = 'You must wait before completing this quest again';
    } else if (error.message.includes('Proof already used')) {
      errorMessage = 'This proof has already been submitted';
    } else if (error.message.includes('User not registered')) {
      errorMessage = 'User not registered on blockchain. Please register first';
    } else if (error.message.includes('Quest not active')) {
      errorMessage = 'This quest is no longer active';
    } else if (error.message.includes('Quest does not exist')) {
      errorMessage = 'Quest not found on blockchain';
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  const configured = !!(ORACLE_PRIVATE_KEY && CONTRACT_ADDRESS);
  
  return NextResponse.json({
    status: configured ? 'ready' : 'not configured',
    oracleAddress: ORACLE_PRIVATE_KEY ? privateKeyToAccount(ORACLE_PRIVATE_KEY).address : null,
    contractAddress: CONTRACT_ADDRESS || null,
  });
}
