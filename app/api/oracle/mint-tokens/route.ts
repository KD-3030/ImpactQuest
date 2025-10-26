import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import CONTRACT_ABI from '@/lib/contracts/ImpactQuest.json';

// Oracle wallet configuration
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY as `0x${string}`;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

/**
 * Oracle endpoint to mint tokens directly to a user
 * This is used to sync MongoDB tokens with blockchain
 * Should only be called internally
 */
export async function POST(request: NextRequest) {
  try {
    // Validate environment
    if (!ORACLE_PRIVATE_KEY || !CONTRACT_ADDRESS) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Oracle service not configured' 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userAddress, amount } = body;

    // Validate required fields
    if (!userAddress || !amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userAddress, amount' 
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid amount. Must be a positive number' 
        },
        { status: 400 }
      );
    }

    console.log('🪙 Oracle minting tokens:', { userAddress, amount });

    // Create public client
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

    // Convert tokens to wei (18 decimals)
    const tokensInWei = BigInt(Math.floor(amount * 10**18));

    // Call smart contract transfer function (mint tokens from oracle to user)
    // Since we can't directly mint, we transfer from oracle's balance
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'transfer',
      args: [userAddress as `0x${string}`, tokensInWei],
    });

    console.log('✅ Token transfer transaction sent:', hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      confirmations: 1,
    });

    console.log('✅ Token transfer confirmed:', receipt);

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      status: receipt.status,
      amount,
      userAddress,
    });

  } catch (error: any) {
    console.error('❌ Oracle mint error:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
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
    endpoint: 'mint-tokens',
  });
}
