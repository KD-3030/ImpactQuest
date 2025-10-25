'use client';

import { useState, useEffect } from 'react';
import { Award, TrendingUp, Users, Coins, Gift, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Container,
  PageHeader,
  Card,
  CardBody,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

interface RewardStats {
  totalTokensDistributed: number;
  totalTokensRedeemed: number;
  activeTokensInCirculation: number;
  totalRewardTransactions: number;
  averageTokensPerUser: number;
  redemptionRate: number;
}

interface RewardTransaction {
  _id: string;
  userId: {
    _id: string;
    walletAddress: string;
    currentStage: string;
  };
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface TopRewarder {
  _id: string;
  walletAddress: string;
  totalImpactPoints: number;
  rewardTokens: number;
  currentStage: string;
}

export default function AdminRewards() {
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RewardTransaction[]>([]);
  const [topRewarders, setTopRewarders] = useState<TopRewarder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRewardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchRewardData = async () => {
    setLoading(true);
    try {
      // Fetch users for token statistics
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();

      if (usersData.success && usersData.users) {
        const users = usersData.users;
        
        // Calculate statistics
        const totalTokensInSystem = users.reduce((sum: number, user: any) => sum + (user.rewardTokens || 0), 0);
        const usersWithTokens = users.filter((u: any) => u.rewardTokens > 0).length;
        const avgTokens = usersWithTokens > 0 ? totalTokensInSystem / usersWithTokens : 0;

        // Get top rewarders
        const topUsers = [...users]
          .sort((a: any, b: any) => (b.rewardTokens || 0) - (a.rewardTokens || 0))
          .slice(0, 10);

        setTopRewarders(topUsers);

        // Fetch reward transactions
        const transactionsResponse = await fetch('/api/admin/rewards/transactions?limit=20');
        const transactionsData = await transactionsResponse.json();
        
        if (transactionsData.success) {
          setRecentTransactions(transactionsData.transactions || []);
          
          const totalDistributed = transactionsData.transactions
            .filter((t: any) => t.amount > 0)
            .reduce((sum: number, t: any) => sum + t.amount, 0);
          
          const totalRedeemed = Math.abs(
            transactionsData.transactions
              .filter((t: any) => t.amount < 0)
              .reduce((sum: number, t: any) => sum + t.amount, 0)
          );

          setStats({
            totalTokensDistributed: totalDistributed,
            totalTokensRedeemed: totalRedeemed,
            activeTokensInCirculation: totalTokensInSystem,
            totalRewardTransactions: transactionsData.transactions.length,
            averageTokensPerUser: avgTokens,
            redemptionRate: totalDistributed > 0 ? (totalRedeemed / totalDistributed) * 100 : 0,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reward data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatWallet = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'quest_completion':
        return Award;
      case 'stage_upgrade':
        return TrendingUp;
      case 'redemption':
        return Gift;
      default:
        return Coins;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getStageEmoji = (stage: string) => {
    const stages: Record<string, string> = {
      seedling: '🌱',
      sprout: '🌿',
      tree: '🌳',
      forest: '🌲',
    };
    return stages[stage] || '🌱';
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading rewards data..." />
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="Rewards Dashboard"
        description="Monitor reward token distribution and redemptions"
      />

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[
          {
            label: 'Total Distributed',
            value: stats?.totalTokensDistributed || 0,
            icon: Coins,
            color: 'from-[#FA2FB5] to-[#FFC23C]',
            trend: '+12%',
          },
          {
            label: 'Total Redeemed',
            value: stats?.totalTokensRedeemed || 0,
            icon: Gift,
            color: 'from-[#31087B] to-[#FA2FB5]',
            trend: '+8%',
          },
          {
            label: 'In Circulation',
            value: stats?.activeTokensInCirculation || 0,
            icon: Activity,
            color: 'from-[#FFC23C] to-[#FA2FB5]',
            trend: 'Live',
          },
          {
            label: 'Avg Per User',
            value: Math.round(stats?.averageTokensPerUser || 0),
            icon: Users,
            color: 'from-[#FA2FB5] to-[#31087B]',
            trend: '~',
          },
          {
            label: 'Redemption Rate',
            value: `${stats?.redemptionRate.toFixed(1) || 0}%`,
            icon: TrendingUp,
            color: 'from-[#31087B] to-[#FFC23C]',
            trend: 'Target: 40%',
          },
          {
            label: 'Transactions',
            value: stats?.totalRewardTransactions || 0,
            icon: DollarSign,
            color: 'from-[#FFC23C] to-[#31087B]',
            trend: 'All time',
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mb-2">
                        {stat.value}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {stat.trend}
                      </Badge>
                    </div>
                    <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#FA2FB5]" />
                  Recent Transactions
                </h3>
                <Badge variant="primary">{recentTransactions.length}</Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No transactions yet
                  </div>
                ) : (
                  recentTransactions.map((transaction, index) => {
                    const Icon = getTransactionIcon(transaction.type);
                    const isPositive = transaction.amount > 0;
                    
                    return (
                      <motion.div
                        key={transaction._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        className="flex items-center gap-3 bg-[#31087B]/30 rounded-lg p-3 hover:bg-[#31087B]/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          <Icon className={`w-4 h-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {formatWallet(transaction.userId.walletAddress)}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {transaction.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className={`font-bold ${getTransactionColor(transaction.amount)}`}>
                            {isPositive ? '+' : ''}{transaction.amount}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Top Rewarders Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FFC23C]" />
                  Top Token Holders
                </h3>
                <Badge variant="warning">Top 10</Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {topRewarders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No users with tokens yet
                  </div>
                ) : (
                  topRewarders.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="flex items-center gap-3 bg-[#31087B]/30 rounded-lg p-3 hover:bg-[#31087B]/50 transition-colors"
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900' :
                          'bg-[#FA2FB5]/20 text-[#FA2FB5]'
                        }
                      `}>
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium">
                            {formatWallet(user.walletAddress)}
                          </p>
                          <span className="text-lg">{getStageEmoji(user.currentStage)}</span>
                        </div>
                        <p className="text-gray-400 text-xs">
                          {user.totalImpactPoints} impact points
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[#FFC23C] font-bold">
                          <Coins className="w-4 h-4" />
                          {user.rewardTokens}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1 capitalize">
                          {user.currentStage}
                        </Badge>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6"
      >
        <Card className="bg-gradient-to-r from-[#31087B]/50 to-[#FA2FB5]/30 border-2 border-[#FA2FB5]/50">
          <CardBody>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FA2FB5] rounded-full">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Manage Redemptions</h4>
                  <p className="text-sm text-gray-300">Review and approve token redemption requests</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/admin/redemptions'}
                className="px-6 py-3 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                View Redemptions
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </Container>
  );
}
