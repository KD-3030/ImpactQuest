'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Sparkles, Gift, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Toast {
  id: string;
  type: 'reward' | 'stage_upgrade' | 'creator_reward' | 'redemption';
  title: string;
  message: string;
  amount?: number;
}

const TOAST_ICONS = {
  reward: Coins,
  stage_upgrade: Sparkles,
  creator_reward: Gift,
  redemption: CheckCircle,
};

const TOAST_COLORS = {
  reward: 'from-[#FFC23C] to-[#FA2FB5]',
  stage_upgrade: 'from-[#FA2FB5] to-[#31087B]',
  creator_reward: 'from-[#31087B] to-[#FA2FB5]',
  redemption: 'from-green-500 to-emerald-600',
};

export default function RewardNotifications() {
  const { address } = useAccount();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!address) return;

    // Connect to real-time events
    const eventSource = new EventSource(`/api/realtime?walletAddress=${address}`);

    eventSource.addEventListener('submission_verified', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.rewardTokens > 0) {
          addToast({
            id: `reward-${Date.now()}`,
            type: 'reward',
            title: 'Tokens Earned!',
            message: `You earned ${data.rewardTokens} reward tokens`,
            amount: data.rewardTokens,
          });
        }
      } catch (error) {
        console.error('Error parsing submission_verified event:', error);
      }
    });

    eventSource.addEventListener('stage_upgraded', (event) => {
      try {
        const data = JSON.parse(event.data);
        addToast({
          id: `stage-${Date.now()}`,
          type: 'stage_upgrade',
          title: 'Stage Upgraded!',
          message: `Congratulations! You've reached ${data.newStage} stage`,
          amount: data.bonusTokens,
        });
      } catch (error) {
        console.error('Error parsing stage_upgraded event:', error);
      }
    });

    eventSource.addEventListener('creator_rewarded', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.creatorAddress?.toLowerCase() === address.toLowerCase()) {
          addToast({
            id: `creator-${Date.now()}`,
            type: 'creator_reward',
            title: 'Creator Reward!',
            message: `Your quest was completed! Earned ${data.rewardTokens} tokens`,
            amount: data.rewardTokens,
          });
        }
      } catch (error) {
        console.error('Error parsing creator_rewarded event:', error);
      }
    });

    eventSource.addEventListener('redemption_created', (event) => {
      try {
        const data = JSON.parse(event.data);
        addToast({
          id: `redemption-${Date.now()}`,
          type: 'redemption',
          title: 'Redemption Successful!',
          message: `Redeemed ${data.tokensRedeemed} tokens for discount`,
          amount: data.tokensRedeemed,
        });
      } catch (error) {
        console.error('Error parsing redemption_created event:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [address]);

  const addToast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type];
          const colorClass = TOAST_COLORS[toast.type];
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`bg-gradient-to-r ${colorClass} rounded-xl shadow-2xl p-4 border border-white/20 backdrop-blur-sm`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm mb-1">
                    {toast.title}
                  </h4>
                  <p className="text-white/90 text-xs">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
