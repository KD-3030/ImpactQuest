'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, User, Store, Coins, Calendar, Tag, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Container,
  PageHeader,
  Card,
  CardBody,
  Button,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

interface Redemption {
  _id: string;
  userId: {
    _id: string;
    walletAddress: string;
    currentStage: string;
  };
  shopId: {
    _id: string;
    name: string;
    category: string;
    location: {
      address: string;
    };
  } | null;
  tokensRedeemed: number;
  discountRate: number;
  purchaseAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  redemptionCode: string;
  createdAt: string;
  completedAt?: string;
}

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRedemptions();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRedemptions();
    }, 30000);

    return () => clearInterval(interval);
  }, [filter]);

  const fetchRedemptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/redemptions${filter !== 'all' ? `?status=${filter}` : ''}`);
      const data = await response.json();
      
      if (data.success) {
        setRedemptions(data.redemptions || []);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Mark this redemption as completed? This confirms the user received their discount.')) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/redemptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchRedemptions();
      } else {
        alert(data.error || 'Failed to complete redemption');
      }
    } catch (error) {
      console.error('Error completing redemption:', error);
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this redemption? Tokens will be refunded to the user.')) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/redemptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchRedemptions();
      } else {
        alert(data.error || 'Failed to cancel redemption');
      }
    } catch (error) {
      console.error('Error cancelling redemption:', error);
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatWallet = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'secondary' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
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

  const pendingCount = redemptions.filter(r => r.status === 'pending').length;
  const completedCount = redemptions.filter(r => r.status === 'completed').length;
  const cancelledCount = redemptions.filter(r => r.status === 'cancelled').length;

  return (
    <Container>
      <PageHeader
        title="Reward Redemptions"
        description="Manage user token redemptions and discount requests"
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          className="whitespace-nowrap"
        >
          All ({redemptions.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
          className="whitespace-nowrap"
        >
          <Filter className="w-4 h-4 mr-1" />
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          onClick={() => setFilter('completed')}
          className="whitespace-nowrap"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Completed ({completedCount})
        </Button>
        <Button
          variant={filter === 'cancelled' ? 'primary' : 'outline'}
          onClick={() => setFilter('cancelled')}
          className="whitespace-nowrap"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Cancelled ({cancelledCount})
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Total Redemptions',
            value: redemptions.length,
            icon: Tag,
            color: 'from-[#FA2FB5] to-[#FFC23C]',
          },
          {
            label: 'Tokens Redeemed',
            value: redemptions.reduce((sum, r) => sum + r.tokensRedeemed, 0),
            icon: Coins,
            color: 'from-[#31087B] to-[#FA2FB5]',
          },
          {
            label: 'Total Discounts',
            value: formatCurrency(redemptions.reduce((sum, r) => sum + r.discountAmount, 0)),
            icon: Store,
            color: 'from-[#FFC23C] to-[#FA2FB5]',
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
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Redemptions List */}
      {loading ? (
        <Card>
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading redemptions..." />
          </CardBody>
        </Card>
      ) : redemptions.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <Store className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No redemptions found</p>
            <p className="text-gray-500 text-sm">Redemptions will appear here when users redeem tokens</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {redemptions.map((redemption, index) => (
            <motion.div
              key={redemption._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column - User & Shop Info */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-white">
                              Redemption #{redemption.redemptionCode}
                            </h3>
                            <Badge variant={getStatusColor(redemption.status)} className="capitalize">
                              {redemption.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(redemption.createdAt)}
                            </span>
                            {redemption.completedAt && (
                              <span className="text-green-400">
                                Completed: {formatDate(redemption.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="bg-[#31087B]/30 rounded-lg p-4 border border-[#FA2FB5]/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-[#FA2FB5]/20 rounded-lg">
                            <User className="w-5 h-5 text-[#FA2FB5]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-400">User</p>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium font-mono">
                                {formatWallet(redemption.userId.walletAddress)}
                              </p>
                              <span className="text-lg">{getStageEmoji(redemption.userId.currentStage)}</span>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {redemption.userId.currentStage}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {redemption.shopId && (
                          <div className="flex items-center gap-3 pt-3 border-t border-[#FA2FB5]/10">
                            <div className="p-2 bg-[#FFC23C]/20 rounded-lg">
                              <Store className="w-5 h-5 text-[#FFC23C]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-400">Shop</p>
                              <p className="text-white font-medium">{redemption.shopId.name}</p>
                              <p className="text-gray-400 text-xs">{redemption.shopId.location.address}</p>
                            </div>
                            <Badge variant="warning" className="capitalize">
                              {redemption.shopId.category}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Pricing Details */}
                      <div className="bg-[#100720]/50 rounded-lg p-4 border border-[#31087B]">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Tokens Used</p>
                            <div className="flex items-center gap-2">
                              <Coins className="w-5 h-5 text-[#FFC23C]" />
                              <p className="text-xl font-bold text-[#FFC23C]">
                                {redemption.tokensRedeemed}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Discount Rate</p>
                            <p className="text-xl font-bold text-[#FA2FB5]">
                              {(redemption.discountRate * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Purchase Amount</p>
                            <p className="text-lg font-bold text-white">
                              {formatCurrency(redemption.purchaseAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Discount Given</p>
                            <p className="text-lg font-bold text-green-400">
                              -{formatCurrency(redemption.discountAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#31087B]">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-400">Final Amount</p>
                            <p className="text-2xl font-bold text-[#FFC23C]">
                              {formatCurrency(redemption.finalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {redemption.status === 'pending' ? (
                          <>
                            <Button
                              variant="success"
                              icon={CheckCircle}
                              onClick={() => handleComplete(redemption._id)}
                              loading={processingId === redemption._id}
                              disabled={processingId !== null}
                            >
                              Mark Complete
                            </Button>
                            <Button
                              variant="danger"
                              icon={XCircle}
                              onClick={() => handleCancel(redemption._id)}
                              loading={processingId === redemption._id}
                              disabled={processingId !== null}
                            >
                              Cancel & Refund
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="cursor-not-allowed"
                          >
                            {redemption.status === 'completed' ? 'Already Completed' : 'Cancelled'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </Container>
  );
}
