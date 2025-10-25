'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Sprout, Target, Award, TrendingUp } from 'lucide-react';

interface UserStats {
  level: number;
  totalImpactPoints: number;
  completedQuests: number;
  stage: string;
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
  const [recentQuests, setRecentQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchUserData();
      fetchRecentQuests();
    }
  }, [address]);

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome Back, Quest Hunter! 🌱
        </h1>
        <p className="text-gray-600">
          Continue your impact journey and grow your garden
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Current Stage</span>
            <span className="text-4xl">{getStageEmoji(userStats.stage)}</span>
          </div>
          <p className="text-3xl font-bold capitalize">{userStats.stage}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-600">Level</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{userStats.level}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600">Impact Points</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{userStats.totalImpactPoints}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600">Quests Done</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{userStats.completedQuests}</p>
        </div>
      </div>

      {/* Progress to Next Stage */}
      {nextStage.needed > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">Progress to {nextStage.next}</h2>
            <span className="text-sm font-medium text-gray-600">
              {nextStage.needed} points needed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Actions & Recent Quests */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/quests')}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-left flex items-center justify-between"
            >
              <span>🗺️ Browse Available Quests</span>
              <span className="text-sm opacity-80">→</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/garden')}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-left flex items-center justify-between"
            >
              <span>🌱 View My Garden</span>
              <span className="text-sm opacity-80">→</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/submissions')}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-left flex items-center justify-between"
            >
              <span>📋 My Submissions</span>
              <span className="text-sm opacity-80">→</span>
            </button>
          </div>
        </div>

        {/* Featured Quests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Featured Quests</h2>
          {recentQuests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No quests available</p>
          ) : (
            <div className="space-y-3">
              {recentQuests.map((quest) => (
                <button
                  key={quest._id}
                  onClick={() => router.push(`/quest/${quest._id}`)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{quest.title}</h3>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      +{quest.impactPoints} pts
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{quest.description}</p>
                  <div className="mt-2">
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
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
