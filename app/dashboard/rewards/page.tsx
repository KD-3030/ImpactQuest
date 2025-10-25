'use client';

import RewardsDashboard from '@/components/RewardsDashboard';

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#100720] via-[#1a0a2e] to-[#31087B] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] bg-clip-text text-transparent">
              Rewards Center
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Track your tokens, view transactions, and redeem rewards
          </p>
        </div>

        {/* Rewards Dashboard Component */}
        <RewardsDashboard />
      </div>
    </div>
  );
}
