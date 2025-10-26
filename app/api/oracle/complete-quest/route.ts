import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, encodeAbiParameters, keccak256 } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import CONTRACT_ABI from '@/lib/contracts/ImpactQuest.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY as `0x${string}`;

export async function POST(request: NextRequest) {
  try {
    const { userAddress, questId, proofData } = await request.json();

    // Validate inputs
    if (!userAddress || questId === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate proof hash from proof data
    const proofHash = keccak256(
      encodeAbiParameters(
        [{ type: 'string' }, { type: 'uint256' }, { type: 'address' }],
        [proofData || 'quest-completion', BigInt(questId), userAddress as `0x${string}`]
      )
    );

    // Create wallet client with oracle account
    const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: celoAlfajores,
      transport: http('https://alfajores-forno.celo-testnet.org'),
    });

    console.log('Completing quest on blockchain:', {
      user: userAddress,
      questId,
      proofHash,
      oracle: account.address,
      contract: CONTRACT_ADDRESS,
    });

    // Call completeQuest on the contract
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'completeQuest',
      args: [userAddress, questId, proofHash],
    });

    console.log('✅ Quest completion transaction sent:', hash);

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      message: 'Quest completed on blockchain',
      proofHash,
    });
  } catch (error: any) {
    console.error('❌ Complete quest error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to complete quest on blockchain',
        details: error.shortMessage || error.details,
      },
      { status: 500 }
    );
  }
}
