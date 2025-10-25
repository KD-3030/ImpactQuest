'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Sprout, Target, Award, TrendingUp, Coins } from 'lucide-react';
import { getUserProfile, getTokenBalance } from '@/lib/blockchain';

interface UserStats {
  level: number;
  totalImpactPoints: number;
  completedQuests: number;
  stage: string;
}

interface BlockchainStats {
  tokenBalance: string;
  onChainLevel: string;
  onChainScore: string;
  questsCompleted: string;
}

interface Quest {
  _id: string;
  title: string;
  description: string;
  impactPoints: number;
  category: string;
}

export default function UserDashboard() {
  const { address } = useAccount();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    totalImpactPoints: 0,
    completedQuests: 0,
    stage: 'seedling',
  });
  const [blockchainStats, setBlockchainStats] = useState<BlockchainStats>({
    tokenBalance: '0',
    onChainLevel: 'Not registered',
    onChainScore: '0',
    questsCompleted: '0',
  });
  const [recentQuests, setRecentQuests] = useState<Quest[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchUserData();
      fetchBlockchainData();
      fetchRecentQuests();
      fetchCompletedQuests();
    }
  }, [address]);

  const fetchBlockchainData = async () => {
    if (!address) return;

    try {
      // Fetch on-chain user profile
      const profile = await getUserProfile(address);
      
      // Fetch IMP token balance
      const balance = await getTokenBalance(address);

      if (profile) {
        const levelNames = ['None', 'Seedling', 'Sprout', 'Sapling', 'Tree'];
        setBlockchainStats({
          tokenBalance: Number(balance).toFixed(2),
          onChainLevel: levelNames[profile.level] || 'Not registered',
          onChainScore: profile.totalImpactScore.toString(),
          questsCompleted: profile.questsCompleted.toString(),
        });
      }
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      // Keep default values if blockchain fetch fails
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user/${address}`);
      const data = await response.json();
      if (data.user) {
        setUserStats(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentQuests = async () => {
    try {
      const response = await fetch('/api/quests');
      const data = await response.json();
      setRecentQuests(data.quests?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
    }
  };

  const fetchCompletedQuests = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/submissions?walletAddress=${address}&verified=true`);
      const data = await response.json();
      
      if (data.success && data.submissions) {
        const completedIds = new Set<string>(
          data.submissions.map((sub: any) => 
            typeof sub.questId === 'string' ? sub.questId : sub.questId?._id?.toString()
          ).filter(Boolean)
        );
        setCompletedQuestIds(completedIds);
      }
    } catch (error) {
      console.error('Error fetching completed quests:', error);
    }
  };

  const getStageEmoji = (stage: string) => {
    switch (stage) {
      case 'seedling': return '🌱';
      case 'sprout': return '🌿';
      case 'tree': return '🌳';
      case 'forest': return '🌲';
      default: return '🌱';
    }
  };

  const getNextStageInfo = () => {
    const points = userStats.totalImpactPoints;
    if (points < 100) return { next: 'Sprout', needed: 100 - points };
    if (points < 300) return { next: 'Tree', needed: 300 - points };
    if (points < 600) return { next: 'Forest', needed: 600 - points };
    return { next: 'Forest Champion', needed: 0 };
  };

  const nextStage = getNextStageInfo();
  const progress = nextStage.needed > 0 
    ? ((userStats.totalImpactPoints % 100) / 100) * 100 
    : 100;

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome Back, Quest Hunter
        </h1>
        <p className="text-gray-300">
          Continue your impact journey and grow your garden
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#FA2FB5] to-[#31087B] rounded-lg shadow-xl p-6 text-white border-2 border-[#FA2FB5]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/90">Current Stage</span>
            <Sprout className="w-8 h-8 text-[#FFC23C]" />
          </div>
          <p className="text-3xl font-bold capitalize">{userStats.stage}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 border-2 border-[#FA2FB5]/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#FFC23C]/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#FFC23C]" />
            </div>
            <span className="text-gray-300">Level</span>
          </div>
          <p className="text-3xl font-bold text-white">{userStats.level}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 border-2 border-[#FA2FB5]/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#FA2FB5]/20 rounded-lg">
              <Award className="w-5 h-5 text-[#FA2FB5]" />
            </div>
            <span className="text-gray-300">Impact Points</span>
          </div>
          <p className="text-3xl font-bold text-white">{userStats.totalImpactPoints}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 border-2 border-[#FA2FB5]/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#31087B]/40 rounded-lg">
              <Target className="w-5 h-5 text-[#FFC23C]" />
            </div>
            <span className="text-gray-300">Quests Done</span>
          </div>
          <p className="text-3xl font-bold text-white">{userStats.completedQuests}</p>
        </div>
      </div>

      {/* Blockchain Stats */}
      <div className="bg-gradient-to-br from-[#31087B] via-[#100720] to-[#31087B] rounded-lg shadow-xl p-6 mb-8 border-2 border-[#FFC23C]/30">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Coins className="w-6 h-6 text-[#FFC23C]" />
          Blockchain Stats (On-Chain Data)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-[#FFC23C]/20">
            <p className="text-sm text-gray-300 mb-1">IMP Token Balance</p>
            <p className="text-2xl font-bold text-[#FFC23C]">{blockchainStats.tokenBalance}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-[#FA2FB5]/20">
            <p className="text-sm text-gray-300 mb-1">On-Chain Level</p>
            <p className="text-2xl font-bold text-[#FA2FB5]">{blockchainStats.onChainLevel}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-[#FFC23C]/20">
            <p className="text-sm text-gray-300 mb-1">On-Chain Score</p>
            <p className="text-2xl font-bold text-white">{blockchainStats.onChainScore}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-[#FA2FB5]/20">
            <p className="text-sm text-gray-300 mb-1">Verified Quests</p>
            <p className="text-2xl font-bold text-white">{blockchainStats.questsCompleted}</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Stage */}
      {nextStage.needed > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 mb-8 border-2 border-[#FFC23C]/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Progress to {nextStage.next}</h2>
            <span className="text-sm font-medium text-gray-300">
              {nextStage.needed} points needed
            </span>
          </div>
          <div className="w-full bg-[#100720] rounded-full h-4 border border-[#FA2FB5]/30">
            <div
              className="bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Quests */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 border-2 border-[#FA2FB5]/30">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/quests')}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#FA2FB5] to-[#31087B] hover:from-[#31087B] hover:to-[#FA2FB5] text-white rounded-lg font-medium transition-all text-left flex items-center justify-between shadow-lg"
            >
              <span>Browse Available Quests</span>
              <span className="text-sm opacity-80">→</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/garden')}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#31087B] to-[#100720] hover:from-[#100720] hover:to-[#31087B] text-white rounded-lg font-medium transition-all text-left flex items-center justify-between shadow-lg"
            >
              <span>View My Garden</span>
              <span className="text-sm opacity-80">→</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/submissions')}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#FFC23C] to-[#FA2FB5] hover:from-[#FA2FB5] hover:to-[#FFC23C] text-white rounded-lg font-medium transition-all text-left flex items-center justify-between shadow-lg"
            >
              <span>My Submissions</span>
              <span className="text-sm opacity-80">→</span>
            </button>
          </div>
        </div>

        {/* Featured Quests */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-6 border-2 border-[#FA2FB5]/30">
          <h2 className="text-xl font-bold text-white mb-4">Featured Quests</h2>
          {recentQuests.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No quests available</p>
          ) : (
            <div className="space-y-3">
              {recentQuests.map((quest) => (
                <button
                  key={quest._id}
                  onClick={() => router.push(`/quest/${quest._id}`)}
                  className={`w-full p-4 border-2 rounded-lg transition-all text-left shadow-lg ${
                    completedQuestIds.has(quest._id)
                      ? 'bg-white/5 border-green-500/50 opacity-70'
                      : 'bg-white/5 border-[#FA2FB5]/20 hover:border-[#FA2FB5] hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">{quest.title}</h3>
                    <div className="flex gap-2 items-center ml-2">
                      {completedQuestIds.has(quest._id) && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                          ✓ Done
                        </span>
                      )}
                      <span className="bg-gradient-to-r from-[#FFC23C] to-[#FA2FB5] text-white px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                        +{quest.impactPoints} pts
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{quest.description}</p>
                  <div className="mt-2">
                    <span className="inline-block bg-[#31087B]/50 text-[#FFC23C] px-2 py-1 rounded text-xs border border-[#FFC23C]/30">
                      {quest.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
