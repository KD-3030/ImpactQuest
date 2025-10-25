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
 * Oracle service that records redemption refunds on blockchain
 * Mints tokens back to user's wallet when admin cancels a redemption
 * This endpoint should be called internally from admin redemptions API
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
    const { userAddress, tokensRefunded, reason } = body;

    // Validate required fields
    if (!userAddress || !tokensRefunded || !reason) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userAddress, tokensRefunded, reason' 
        },
        { status: 400 }
      );
    }

    // Validate token amount
    if (typeof tokensRefunded !== 'number' || tokensRefunded <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid tokensRefunded. Must be a positive number' 
        },
        { status: 400 }
      );
    }

    console.log('Oracle recording redemption refund:', { userAddress, tokensRefunded, reason });

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
    const tokensInWei = BigInt(Math.floor(tokensRefunded * 10**18));

    // Call smart contract recordRedemptionRefund function
    // This mints tokens back to the user's wallet
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'recordRedemptionRefund',
      args: [userAddress as `0x${string}`, tokensInWei, reason],
    });

    console.log('Refund transaction sent:', hash);

    // Wait for transaction confirmation using public client
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      confirmations: 1, // Wait for 1 confirmation
    });

    console.log('Refund transaction confirmed:', receipt);

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
      gasUsed: receipt.gasUsed.toString(),
      tokensRefunded,
      reason,
    });

  } catch (error: any) {
    console.error('Oracle redemption refund error:', error);

    // Parse contract revert errors
    let errorMessage = error.message;
    
    if (error.message.includes('User not registered')) {
      errorMessage = 'User not registered on blockchain. Please register first';
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
    endpoint: 'record-redemption-refund',
  });
}
