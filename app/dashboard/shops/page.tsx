'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
  Store,
  MapPin,
  Filter,
  Search,
  Coins,
  ShoppingBag,
  Package,
  Shirt,
  Utensils,
  Zap,
  X,
} from 'lucide-react';
import RedemptionModal from '@/components/RedemptionModal';

interface LocalShop {
  _id: string;
  name: string;
  description: string;
  category: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  imageUrl?: string;
  acceptsRewardTokens: boolean;
  minimumStage: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

const CATEGORIES = [
  { id: 'all', label: 'All Shops', icon: Store },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'clothing', label: 'Clothing', icon: Shirt },
  { id: 'electronics', label: 'Electronics', icon: Zap },
  { id: 'services', label: 'Services', icon: Package },
  { id: 'groceries', label: 'Groceries', icon: ShoppingBag },
];

const STAGE_EMOJIS: Record<string, string> = {
  seedling: '🌱',
  sprout: '🌿',
  tree: '🌳',
  forest: '🌲',
};

export default function ShopsPage() {
  const { address } = useAccount();
  const [shops, setShops] = useState<LocalShop[]>([]);
  const [filteredShops, setFilteredShops] = useState<LocalShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<LocalShop | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const [userDiscountRate, setUserDiscountRate] = useState(10);
  const [userStage, setUserStage] = useState('seedling');

  useEffect(() => {
    fetchShops();
    if (address) {
      fetchUserData();
    }
  }, [address]);

  useEffect(() => {
    filterShops();
  }, [shops, selectedCategory, searchQuery]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shops');
      const data = await response.json();

      if (data.success) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/rewards?walletAddress=${address}&limit=1`);
      const data = await response.json();

      if (data.success && data.user) {
        setUserTokens(data.user.rewardTokens || 0);
        setUserDiscountRate(data.user.discountRate || 10);
        setUserStage(data.user.stage || 'seedling');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const filterShops = () => {
    let filtered = [...shops];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((shop) => shop.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.description?.toLowerCase().includes(query) ||
          shop.location.address.toLowerCase().includes(query)
      );
    }

    setFilteredShops(filtered);
  };

  const handleShopClick = (shop: LocalShop) => {
    setSelectedShop(shop);
    setShowRedeemModal(true);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = CATEGORIES.find((c) => c.id === category);
    const Icon = categoryData?.icon || Store;
    return <Icon className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#100720] via-[#1a0a2e] to-[#31087B] p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100720] via-[#1a0a2e] to-[#31087B] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] bg-clip-text text-transparent">
              Local Shops
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Redeem your tokens for discounts at local businesses
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="space-y-4">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops by name, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FA2FB5] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 overflow-x-auto pb-2"
          >
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white shadow-lg'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Results Count */}
        <div className="text-gray-400 text-sm">
          {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
        </div>

        {/* Shop Grid */}
        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop, index) => (
              <motion.div
                key={shop._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleShopClick(shop)}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-purple-500/20 p-6 cursor-pointer group"
              >
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FA2FB5]/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#FA2FB5]/20 to-[#FFC23C]/20 border border-[#FA2FB5]/30">
                        {getCategoryIcon(shop.category)}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg group-hover:text-[#FA2FB5] transition-colors">
                          {shop.name}
                        </h3>
                        <span className="text-gray-400 text-xs capitalize">
                          {shop.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {shop.description && (
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {shop.description}
                    </p>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{shop.location.address}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {shop.acceptsRewardTokens && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFC23C]/20 text-[#FFC23C] text-xs font-medium">
                        <Coins className="w-3 h-3" />
                        Accepts Tokens
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                      {STAGE_EMOJIS[shop.minimumStage]} {shop.minimumStage}+
                    </span>
                  </div>

                  {/* Redeem Button */}
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white font-bold hover:shadow-lg hover:shadow-[#FA2FB5]/50 transition-all">
                    Redeem Tokens
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Store className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">No shops found</h3>
            <p className="text-gray-400">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Check back later for participating businesses'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Redemption Modal */}
      {selectedShop && (
        <RedemptionModal
          shop={selectedShop}
          userTokens={userTokens}
          userDiscountRate={userDiscountRate}
          userStage={userStage}
          isOpen={showRedeemModal}
          onClose={() => {
            setShowRedeemModal(false);
            setSelectedShop(null);
          }}
          onSuccess={() => {
            // Refresh user data after successful redemption
            fetchUserData();
          }}
        />
      )}
    </div>
  );
}
