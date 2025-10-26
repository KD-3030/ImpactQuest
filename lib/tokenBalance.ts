import { createPublicClient, http, formatUnits } from 'viem';
import { celoAlfajores } from 'viem/chains';
import CONTRACT_ABI from '@/contracts/artifacts/contracts/ImpactQuest.sol/ImpactQuest.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

/**
 * Get user's IMP token balance from the blockchain
 */
export async function getTokenBalance(userAddress: `0x${string}`): Promise<number> {
  try {
    const publicClient = createPublicClient({
      chain: celoAlfajores,
      transport: http('https://alfajores-forno.celo-testnet.org'),
    });

    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'balanceOf',
      args: [userAddress],
    }) as bigint;

    // Convert from wei to tokens (18 decimals)
    return parseFloat(formatUnits(balance, 18));
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
}

/**
 * Watch for token balance changes in real-time
 */
export function watchTokenBalance(
  userAddress: `0x${string}`,
  onBalanceChange: (balance: number) => void
) {
  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http('https://alfajores-forno.celo-testnet.org'),
  });

  // Poll for balance changes every 3 seconds
  const intervalId = setInterval(async () => {
    try {
      const balance = await getTokenBalance(userAddress);
      onBalanceChange(balance);
    } catch (error) {
      console.error('Error watching balance:', error);
    }
  }, 3000);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Trigger MetaMask to refresh token balance
 * Note: This requests MetaMask to add/watch the token, which updates the balance
 */
export async function refreshMetaMaskTokenBalance() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: CONTRACT_ADDRESS,
            symbol: 'IMP',
            decimals: 18,
            image: 'https://your-logo-url.com/imp-token.png', // Optional: Add your token logo
          },
        },
      });
      console.log('✅ Token added to MetaMask');
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
    }
  }
}
