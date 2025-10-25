'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sprout, Target, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isConnected } = useAccount();
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if explicitly connected, not on initial page load
    // This prevents auto-redirect to last signed-in user page
    if (isConnected) {
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'user') {
        router.push('/dashboard');
      } else if (!role) {
        router.push('/login');
      }
    }
  }, [isConnected, role, router]);

  const handleGetStarted = () => {
    router.push('/login');
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

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] rounded-full p-6 animate-pulse shadow-2xl">
              <Sprout className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Turn Impact Into Achievement
          </h1>
          
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
            Complete real-world environmental quests, verify your impact with AI, 
            and watch your on-chain reputation grow from a seedling to a forest.
          </p>

          <div className="mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] hover:from-[#FFC23C] hover:to-[#FA2FB5] text-white font-bold py-4 px-8 rounded-lg text-lg shadow-2xl hover:shadow-[#FA2FB5]/50 transition-all transform hover:scale-105"
            >
              🌱 Get Started
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl border-2 border-[#FA2FB5]/30 hover:border-[#FA2FB5] transition-all">
              <Target className="w-12 h-12 text-[#FFC23C] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Find Quests</h3>
              <p className="text-gray-200">
                Discover nearby environmental challenges on an interactive map
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl border-2 border-[#FA2FB5]/30 hover:border-[#FA2FB5] transition-all">
              <TrendingUp className="w-12 h-12 text-[#FFC23C] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Prove Impact</h3>
              <p className="text-gray-200">
                Capture your action with AI-verified photo proof
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl border-2 border-[#FA2FB5]/30 hover:border-[#FA2FB5] transition-all">
              <Trophy className="w-12 h-12 text-[#FFC23C] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Grow On-Chain</h3>
              <p className="text-gray-200">
                Earn points, level up, and evolve your impact garden
              </p>
            </div>
          </div>

          {/* Growth Stages */}
          <div className="mt-20 bg-white/5 backdrop-blur-md p-8 rounded-2xl border-2 border-[#FFC23C]/30">
            <h2 className="text-3xl font-bold text-white mb-8">Your Growth Journey</h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-5xl mb-2">🌱</div>
                <div className="text-white font-medium">Seedling</div>
                <div className="text-gray-300 text-sm">0-100 pts</div>
              </div>
              <div className="text-[#FA2FB5] text-3xl">→</div>
              <div className="text-center">
                <div className="text-5xl mb-2">🌿</div>
                <div className="text-white font-medium">Sprout</div>
                <div className="text-gray-300 text-sm">100-300 pts</div>
              </div>
              <div className="text-[#FA2FB5] text-3xl">→</div>
              <div className="text-center">
                <div className="text-5xl mb-2">🌳</div>
                <div className="text-white font-medium">Tree</div>
                <div className="text-gray-300 text-sm">300-600 pts</div>
              </div>
              <div className="text-[#FA2FB5] text-3xl">→</div>
              <div className="text-center">
                <div className="text-5xl mb-2">🌲</div>
                <div className="text-white font-medium">Forest</div>
                <div className="text-gray-300 text-sm">600+ pts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-8 text-center text-gray-300 border-t border-[#FA2FB5]/20">
        <p>Built with 💜 on Celo | Making Environmental Impact Verifiable</p>
      </footer>
    </main>
  );
}
