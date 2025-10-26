'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, useAccount, useSwitchChain } from 'wagmi';
import {
  celo,
  celoAlfajores,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { AuthProvider } from '@/lib/auth-context';
import ErrorBoundary from '@/components/ErrorBoundary';
import RewardNotifications from '@/components/RewardNotifications';
import { useState, useEffect } from 'react';

const config = getDefaultConfig({
  appName: 'ImpactQuest',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3c3d6d8a8b5e4c8f9a7b6d5e4f3c2b1a',
  chains: [celoAlfajores],
  ssr: true,
});

// Suppress WalletConnect warnings and errors in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args: any[]) => {
    // Suppress specific WalletConnect warnings
    if (
      args[0]?.includes?.('Reown Config') ||
      args[0]?.includes?.('WalletConnect Core is already initialized') ||
      args[0]?.includes?.('WalletConnect')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args: any[]) => {
    // Suppress WalletConnect connection errors (they auto-retry)
    if (
      args[0]?.message?.includes?.('Connection interrupted') ||
      args[0]?.includes?.('subscription') ||
      args[0]?.includes?.('Subscribing to') ||
      args[0]?.context === 'core/relayer/subscription' ||
      args[0]?.context === 'client'
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

function NetworkChecker() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check if connected to wrong network
    if (chain && chain.id !== celoAlfajores.id) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [chain]);

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: celoAlfajores.id });
      setShowWarning(false);
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Wrong Network Detected!</p>
            <p className="text-sm">You're on {chain?.name || 'unknown network'}. Please switch to Celo Alfajores Testnet.</p>
          </div>
        </div>
        <button
          onClick={handleSwitchNetwork}
          className="bg-white text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
        >
          Switch to Alfajores
        </button>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to avoid recreation on every render
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: false, // Disable retries to reduce network requests
      },
    },
  }));

  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider 
            modalSize="compact"
            showRecentTransactions={false}
          >
            <AuthProvider>
              <NetworkChecker />
              <RewardNotifications />
              {children}
            </AuthProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}
