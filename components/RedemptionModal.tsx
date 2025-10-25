'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
  X,
  Coins,
  TrendingDown,
  Check,
  Copy,
  QrCode,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface RedemptionModalProps {
  shop: {
    _id: string;
    name: string;
    description?: string;
    category: string;
    minimumStage: string;
  };
  userTokens: number;
  userDiscountRate: number;
  userStage: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface RedemptionResponse {
  success: boolean;
  redemption?: {
    redemptionCode: string;
    tokensRedeemed: number;
    discountAmount: number;
    finalAmount: number;
  };
  remainingTokens?: number;
  error?: string;
}

const STAGE_ORDER = ['seedling', 'sprout', 'tree', 'forest'];

export default function RedemptionModal({
  shop,
  userTokens,
  userDiscountRate,
  userStage,
  isOpen,
  onClose,
  onSuccess,
}: RedemptionModalProps) {
  const { address } = useAccount();
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Calculate discount preview
  const amount = parseFloat(purchaseAmount) || 0;
  const discountAmount = (amount * userDiscountRate) / 100;
  const tokensRequired = Math.round(discountAmount); // 1 token = 1 cUSD
  const finalAmount = amount - discountAmount;

  // Check if user meets requirements
  const stageIndex = STAGE_ORDER.indexOf(userStage);
  const requiredStageIndex = STAGE_ORDER.indexOf(shop.minimumStage);
  const meetsStageRequirement = stageIndex >= requiredStageIndex;
  const hasEnoughTokens = tokensRequired <= userTokens;

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPurchaseAmount('');
      setRedemptionCode('');
      setCopied(false);
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleRedeem = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (amount <= 0) {
      setError('Please enter a valid purchase amount');
      return;
    }

    if (!meetsStageRequirement) {
      setError(`You need to reach ${shop.minimumStage} stage to redeem at this shop`);
      return;
    }

    if (!hasEnoughTokens) {
      setError(`You need ${tokensRequired} tokens but only have ${userTokens}`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/redemptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          shopId: shop._id,
          purchaseAmount: amount,
        }),
      });

      const data: RedemptionResponse = await response.json();

      if (data.success && data.redemption) {
        setRedemptionCode(data.redemption.redemptionCode);
        setSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(data.error || 'Failed to create redemption');
      }
    } catch (err) {
      console.error('Redemption error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(redemptionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#100720] to-[#31087B] rounded-2xl p-8 max-w-lg w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            /* Success View */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Redemption Successful!
                </h2>
                <p className="text-gray-400">
                  Show this code to the shop to claim your discount
                </p>
              </div>

              {/* Redemption Code */}
              <div className="relative p-6 rounded-xl bg-white/5 border-2 border-[#FA2FB5]/30">
                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm">Redemption Code</p>
                  <p className="text-3xl font-bold text-[#FFC23C] font-mono tracking-wider">
                    {redemptionCode}
                  </p>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 p-4 rounded-xl bg-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Original Amount</span>
                  <span className="text-white font-semibold">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Discount ({userDiscountRate}%)</span>
                  <span className="text-green-400 font-semibold">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tokens Used</span>
                  <span className="text-[#FFC23C] font-semibold">{tokensRequired} tokens</span>
                </div>
                <div className="h-px bg-white/20" />
                <div className="flex justify-between">
                  <span className="text-white font-bold">Final Amount</span>
                  <span className="text-2xl font-bold text-[#FA2FB5]">
                    ${finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white font-bold hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            /* Redemption Form */
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{shop.name}</h2>
                <p className="text-gray-400 text-sm capitalize">{shop.category}</p>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">Your Tokens</p>
                  <p className="text-white font-bold text-lg flex items-center gap-1">
                    <Coins className="w-4 h-4 text-[#FFC23C]" />
                    {userTokens}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">Discount Rate</p>
                  <p className="text-white font-bold text-lg flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-[#FA2FB5]" />
                    {userDiscountRate}%
                  </p>
                </div>
              </div>

              {/* Purchase Amount Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Purchase Amount (cUSD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-4 bg-white/10 border border-purple-500/30 rounded-xl text-white text-lg font-semibold placeholder-gray-500 focus:outline-none focus:border-[#FA2FB5] transition-colors"
                  />
                </div>
              </div>

              {/* Discount Preview */}
              {amount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-[#FA2FB5]/10 to-[#FFC23C]/10 border border-[#FA2FB5]/30"
                >
                  <div className="flex items-center gap-2 text-[#FFC23C] text-sm font-semibold">
                    <TrendingDown className="w-4 h-4" />
                    Discount Breakdown
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Original</span>
                      <span className="text-white font-semibold">${amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Discount ({userDiscountRate}%)</span>
                      <span className="text-green-400 font-semibold">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tokens Required</span>
                      <span className={`font-semibold ${hasEnoughTokens ? 'text-[#FFC23C]' : 'text-red-400'}`}>
                        {tokensRequired} tokens
                      </span>
                    </div>
                    <div className="h-px bg-white/20" />
                    <div className="flex justify-between text-lg">
                      <span className="text-white font-bold">You Pay</span>
                      <span className="text-[#FA2FB5] font-bold">
                        ${finalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Warning Messages */}
              {!meetsStageRequirement && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-300 text-sm">
                    You need to reach <span className="font-semibold">{shop.minimumStage}</span>{' '}
                    stage to redeem at this shop
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={
                    loading ||
                    amount <= 0 ||
                    !hasEnoughTokens ||
                    !meetsStageRequirement
                  }
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {loading ? 'Processing...' : 'Redeem Tokens'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
