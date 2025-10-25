'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
  Coins,
  TrendingUp,
  Gift,
  Store,
  ArrowUpRight,
  Sparkles,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RewardTransaction {
  _id: string;
  type: 'quest_completion' | 'stage_upgrade' | 'creator_reward' | 'redemption';
  amount: number;
  description: string;
  createdAt: string;
  questId?: {
    title: string;
  };
  previousStage?: string;
  newStage?: string;
}

interface RewardsSummary {
  totalEarned: number;
  totalRedeemed: number;
  availableTokens: number;
  currentStage: string;
  nextStage: string | null;
  pointsToNextStage: number;
  nextStageBonus: number;
  discountRate: number;
}

interface UserStats {
  rewardTokens: number;
  discountRate: number;
  stage: string;
  totalRewardsEarned: number;
  totalImpactPoints: number;
}

const STAGE_COLORS = {
  seedling: 'from-green-400 to-emerald-500',
  sprout: 'from-yellow-400 to-green-500',
  tree: 'from-blue-400 to-green-600',
  forest: 'from-purple-500 to-green-700',
};

const STAGE_ICONS = {
  seedling: '🌱',
  sprout: '🌿',
  tree: '🌳',
  forest: '🌲',
};

export default function RewardsDashboard() {
  const { address } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [summary, setSummary] = useState<RewardsSummary | null>(null);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);

  useEffect(() => {
    if (address) {
      fetchRewardsData();
    }
  }, [address]);

  const fetchRewardsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/rewards?walletAddress=${address}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setUserStats(data.user);
        setSummary(data.summary);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'quest_completion':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'stage_upgrade':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'creator_reward':
        return <Gift className="w-5 h-5 text-pink-400" />;
      case 'redemption':
        return <Store className="w-5 h-5 text-red-400" />;
      default:
        return <Coins className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!userStats || !summary) {
    return (
      <div className="text-center py-12">
        <Coins className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-400">No rewards data available</p>
      </div>
    );
  }

  const stageColor = STAGE_COLORS[userStats.stage as keyof typeof STAGE_COLORS] || STAGE_COLORS.seedling;
  const stageIcon = STAGE_ICONS[userStats.stage as keyof typeof STAGE_ICONS] || STAGE_ICONS.seedling;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Tokens Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#100720] to-[#31087B] p-6 border border-purple-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FA2FB5]/20 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Available Tokens</span>
              <Coins className="w-5 h-5 text-[#FFC23C]" />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-white">{summary.availableTokens}</h3>
              <span className="text-[#FFC23C] text-lg">tokens</span>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Total earned: {summary.totalEarned} tokens
            </p>
          </div>
        </motion.div>

        {/* Current Stage Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stageColor} p-6`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm">Current Stage</span>
              <span className="text-4xl">{stageIcon}</span>
            </div>
            <h3 className="text-3xl font-bold text-white capitalize mb-1">
              {userStats.stage}
            </h3>
            <div className="flex items-center gap-2 text-white/90">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{userStats.discountRate}% discount rate</span>
            </div>
          </div>
        </motion.div>

        {/* Next Stage Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#31087B] to-[#100720] p-6 border border-[#FA2FB5]/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFC23C]/20 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Next Stage</span>
              <Sparkles className="w-5 h-5 text-[#FA2FB5]" />
            </div>
            {summary.nextStage ? (
              <>
                <h3 className="text-3xl font-bold text-white capitalize mb-2">
                  {summary.nextStage}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-[#FFC23C] font-semibold">
                      {summary.pointsToNextStage} points needed
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#FA2FB5] text-xs">
                    <Gift className="w-4 h-4" />
                    <span>+{summary.nextStageBonus} token bonus!</span>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Max Level!</h3>
                <p className="text-gray-400 text-sm">You've reached the forest stage 🎉</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/shops')}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] p-6 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-white" />
              <div className="text-left">
                <h4 className="text-white font-bold text-lg">Browse Shops</h4>
                <p className="text-white/80 text-sm">Redeem your tokens</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard/quests')}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#31087B] to-[#100720] p-6 border border-purple-500/30 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#FFC23C]" />
              <div className="text-left">
                <h4 className="text-white font-bold text-lg">Complete Quests</h4>
                <p className="text-gray-400 text-sm">Earn more tokens</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl bg-gradient-to-br from-[#100720] to-[#31087B]/50 p-6 border border-purple-500/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-[#FA2FB5]" />
            Recent Transactions
          </h3>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {transaction.description}
                  </p>
                  {transaction.questId && (
                    <p className="text-gray-400 text-sm truncate">
                      {transaction.questId.title}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
                <div
                  className={`flex-shrink-0 font-bold text-lg ${
                    transaction.type === 'redemption'
                      ? 'text-red-400'
                      : 'text-[#FFC23C]'
                  }`}
                >
                  {transaction.type === 'redemption' ? '-' : '+'}
                  {transaction.amount}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Coins className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No transactions yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Complete quests to earn your first tokens!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
