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
 * Oracle service that records redemptions on blockchain
 * Burns tokens from user's wallet and records the transaction
 * This endpoint should be called internally from redemptions API
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
    const { userAddress, tokensSpent, shopName } = body;

    // Validate required fields
    if (!userAddress || !tokensSpent || !shopName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userAddress, tokensSpent, shopName' 
        },
        { status: 400 }
      );
    }

    // Validate token amount
    if (typeof tokensSpent !== 'number' || tokensSpent <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid tokensSpent. Must be a positive number' 
        },
        { status: 400 }
      );
    }

    console.log('Oracle recording redemption:', { userAddress, tokensSpent, shopName });

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

    // Convert tokens to wei (IMP has 18 decimals like Ether)
    const tokensInWei = BigInt(Math.floor(tokensSpent * 10**18));

    // Calculate CELO amount to send (for demo, 0.01 CELO per redemption)
    // You can replace this logic with your own pricing
    const celoAmount = BigInt(Math.floor(0.01 * 1e18));

    // Call smart contract recordRedemption function with CELO value
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'recordRedemption',
      args: [userAddress as `0x${string}`, tokensInWei, shopName],
      value: celoAmount,
    });

    console.log('Redemption transaction sent:', hash);

    // Wait for transaction confirmation using public client
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      confirmations: 1, // Wait for 1 confirmation
    });

    console.log('Redemption transaction confirmed:', receipt);

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
      gasUsed: receipt.gasUsed.toString(),
      tokensSpent,
      shopName,
    });

  } catch (error: any) {
    console.error('Oracle redemption error:', error);

    // Parse contract revert errors
    let errorMessage = error.message;
    
    if (error.message.includes('User not registered')) {
      errorMessage = 'User not registered on blockchain. Please register first';
    } else if (error.message.includes('Insufficient token balance')) {
      errorMessage = 'Insufficient token balance on blockchain';
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
    endpoint: 'record-redemption',
  });
}
