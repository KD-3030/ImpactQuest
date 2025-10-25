import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { celoAlfajores } from 'viem/chains';
import CONTRACT_ABI from '@/lib/contracts/ImpactQuest.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

/**
 * Check if a user is registered on the blockchain
 * Frontend will use this to determine if user needs to call joinImpactQuest()
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');

    if (!userAddress || !CONTRACT_ADDRESS) {
      return NextResponse.json(
        { success: false, error: 'Missing address or contract not configured' },
        { status: 400 }
      );
    }

    const publicClient = createPublicClient({
      chain: celoAlfajores,
      transport: http(),
    });

    // Check if user is registered
    const userProfile = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'userProfiles',
      args: [userAddress],
    });

    const [level, totalImpactScore, questsCompleted, lastQuestTimestamp, joinedTimestamp, isActive] = userProfile as any[];

    return NextResponse.json({
      success: true,
      isRegistered: Boolean(isActive),
      profile: {
        level: Number(level),
        totalImpactScore: Number(totalImpactScore),
        questsCompleted: Number(questsCompleted),
        lastQuestTimestamp: Number(lastQuestTimestamp),
        joinedTimestamp: Number(joinedTimestamp),
        isActive: Boolean(isActive),
      },
    });

  } catch (error: any) {
    console.error('Error checking registration:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
