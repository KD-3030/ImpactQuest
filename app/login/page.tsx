'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield, Users, Sprout } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { address, isConnected } = useAccount();
  const { role, setRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already has a role
    if (isConnected && role === 'admin') {
      router.push('/admin/dashboard');
    } else if (isConnected && role === 'user') {
      router.push('/dashboard');
    }
  }, [isConnected, role, router]);

  const handleRoleSelection = (selectedRole: 'admin' | 'user') => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    setRole(selectedRole);
    
    // Redirect based on role
    if (selectedRole === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-green-600" />
          <h1 className="text-2xl font-bold text-green-800">ImpactQuest</h1>
        </div>
        <ConnectButton />
      </header>

      {/* Login Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-green-900 mb-4">
            Welcome to ImpactQuest
          </h1>
          <p className="text-xl text-green-700 mb-12">
            Connect your wallet and choose your role to get started
          </p>

          {/* Wallet Connection Step */}
          {!isConnected && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Step 1: Connect Your Wallet
                </h2>
                <p className="text-gray-600">
                  Connect your Celo wallet to continue
                </p>
              </div>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          )}

          {/* Role Selection Step */}
          {isConnected && !role && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Step 2: Choose Your Role
                </h2>
                <p className="text-gray-600">
                  Select how you want to participate in ImpactQuest
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Quest Master Card */}
                <div
                  onClick={() => handleRoleSelection('admin')}
                  className="border-2 border-gray-200 rounded-xl p-8 hover:border-green-500 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Quest Master
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create and manage environmental quests, review submissions, and track impact
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Create & edit quests</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Review submissions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Manage users</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>View analytics</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Continue as Quest Master
                  </button>
                </div>

                {/* Quest Hunter Card */}
                <div
                  onClick={() => handleRoleSelection('user')}
                  className="border-2 border-gray-200 rounded-xl p-8 hover:border-green-500 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Quest Hunter
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Complete environmental challenges, earn impact points, and grow your reputation
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Browse nearby quests</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Submit proof of impact</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Earn impact points</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>Grow your garden</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Continue as Quest Hunter
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                Connected as: <span className="font-mono font-bold">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-green-700">
        <p>Built on Celo 🌍 Powered by AI ✨</p>
      </footer>
    </main>
  );
}
