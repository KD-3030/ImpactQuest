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
    if (isConnected && role === 'admin') {
      router.push('/admin/dashboard');
    } else if (isConnected && role === 'user') {
      router.push('/dashboard');
    } else if (isConnected && !role) {
      router.push('/login');
    }
  }, [isConnected, role, router]);

  const handleGetStarted = () => {
    router.push('/login');
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

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="bg-green-500 rounded-full p-6 animate-pulse">
              <Sprout className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-green-900 mb-6">
            Turn Impact Into Achievement
          </h1>
          
          <p className="text-xl text-green-700 mb-12 max-w-2xl mx-auto">
            Complete real-world environmental quests, verify your impact with AI, 
            and watch your on-chain reputation grow from a seedling to a forest.
          </p>

          <div className="mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              🌱 Get Started
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Find Quests</h3>
              <p className="text-gray-600">
                Discover nearby environmental challenges on an interactive map
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Prove Impact</h3>
              <p className="text-gray-600">
                Capture your action with AI-verified photo proof
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Grow & Earn</h3>
              <p className="text-gray-600">
                Watch your reputation evolve and unlock real-world perks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-green-700">
        <p>Built on Celo 🌍 Powered by AI ✨</p>
      </footer>
    </main>
  );
}
