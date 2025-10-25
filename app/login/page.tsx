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
    <main className="min-h-screen bg-gradient-to-br from-[#100720] via-[#31087B] to-[#100720]">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-[#FA2FB5]/20">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-[#FA2FB5]" />
          <h1 className="text-2xl font-bold text-[#FA2FB5]">ImpactQuest</h1>
        </div>
        <ConnectButton />
      </header>

      {/* Login Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to ImpactQuest
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Connect your wallet and choose your role to get started
          </p>

          {/* Wallet Connection Step */}
          {!isConnected && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 mb-8 border-2 border-[#FA2FB5]/30">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FA2FB5] to-[#FFC23C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Step 1: Connect Your Wallet
                </h2>
                <p className="text-gray-300">
                  Connect your Celo wallet to continue
                </p>
              </div>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] hover:from-[#FFC23C] hover:to-[#FA2FB5] text-white font-bold py-4 px-8 rounded-lg text-lg shadow-2xl hover:shadow-[#FA2FB5]/50 transition-all transform hover:scale-105"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          )}

          {/* Role Selection Step */}
          {isConnected && !role && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 border-2 border-[#FA2FB5]/30">
              <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FA2FB5] to-[#FFC23C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Step 2: Choose Your Role
                </h2>
                <p className="text-gray-300">
                  Select how you want to participate in ImpactQuest
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Quest Master Card */}
                <div
                  onClick={() => handleRoleSelection('admin')}
                  className="bg-white/5 border-2 border-[#FA2FB5]/30 rounded-xl p-8 hover:border-[#FA2FB5] hover:bg-white/10 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#FA2FB5] to-[#31087B] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Quest Master
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Create and manage environmental quests, review submissions, and track impact
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#FFC23C]">✓</span>
                      <span>Create & edit quests</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#FFC23C]">✓</span>
                      <span>Review submissions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#FFC23C]">✓</span>
                      <span>Manage users</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#FFC23C]">✓</span>
                      <span>View analytics</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full bg-gradient-to-r from-[#FA2FB5] to-[#31087B] hover:from-[#31087B] hover:to-[#FA2FB5] text-white font-bold py-3 rounded-lg transition-all shadow-lg">
                    Continue as Quest Master
                  </button>
                </div>

                {/* Quest Hunter Card */}
                <div
                  onClick={() => handleRoleSelection('user')}
                  className="bg-white/5 border-2 border-[#FA2FB5]/30 rounded-xl p-8 hover:border-[#FFC23C] hover:bg-white/10 hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-[#FFC23C] to-[#FA2FB5] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Quest Hunter
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Complete environmental challenges, earn impact points, and grow your reputation
                  </p>
                  <div className="space-y-2 text-sm text-left">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#FFC23C]">✓</span>
                      <span>Browse nearby quests</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#FFC23C]">✓</span>
                      <span>Submit proof of impact</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#FFC23C]">✓</span>
                      <span>Earn impact points</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-[#FFC23C]">✓</span>
                      <span>Grow your garden</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full bg-gradient-to-r from-[#FFC23C] to-[#FA2FB5] hover:from-[#FA2FB5] hover:to-[#FFC23C] text-white font-bold py-3 rounded-lg transition-all shadow-lg">
                    Continue as Quest Hunter
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-6">
                Connected as: <span className="font-mono font-bold text-[#FFC23C]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-300 border-t border-[#FA2FB5]/20">
        <p>Built with 💜 on Celo | Making Environmental Impact Verifiable</p>
      </footer>
    </main>
  );
}
