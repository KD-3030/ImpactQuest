'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Award, TrendingUp, Target, Calendar } from 'lucide-react';

interface UserStats {
  level: number;
  totalImpactPoints: number;
  completedQuests: number;
  stage: string;
  createdAt: string;
}

export default function MyGarden() {
  const { address } = useAccount();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    totalImpactPoints: 0,
    completedQuests: 0,
    stage: 'seedling',
    createdAt: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchUserStats();
    }
  }, [address]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/user/${address}`);
      const data = await response.json();
      if (data.user) {
        setUserStats(data.user);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
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

  const getStageInfo = (stage: string) => {
    switch (stage) {
      case 'seedling':
        return {
          title: 'Seedling',
          description: 'Just starting your impact journey',
          range: '0-100 points',
          color: 'from-green-400 to-green-500',
        };
      case 'sprout':
        return {
          title: 'Sprout',
          description: 'Growing your green footprint',
          range: '100-300 points',
          color: 'from-emerald-400 to-emerald-500',
        };
      case 'tree':
        return {
          title: 'Tree',
          description: 'Making substantial impact',
          range: '300-600 points',
          color: 'from-teal-400 to-teal-500',
        };
      case 'forest':
        return {
          title: 'Forest',
          description: 'Champion of environmental action',
          range: '600+ points',
          color: 'from-cyan-400 to-cyan-500',
        };
      default:
        return {
          title: 'Seedling',
          description: 'Just starting',
          range: '0-100 points',
          color: 'from-green-400 to-green-500',
        };
    }
  };

  const stageInfo = getStageInfo(userStats.stage);
  
  const nextStagePoints = () => {
    const points = userStats.totalImpactPoints;
    if (points < 100) return 100;
    if (points < 300) return 300;
    if (points < 600) return 600;
    return 600;
  };

  const progressToNext = () => {
    const points = userStats.totalImpactPoints;
    if (points < 100) return (points / 100) * 100;
    if (points < 300) return ((points - 100) / 200) * 100;
    if (points < 600) return ((points - 300) / 300) * 100;
    return 100;
  };

  const memberSince = new Date(userStats.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🌱 My Impact Garden
        </h1>
        <p className="text-gray-600">
          Track your environmental impact and watch your garden grow
        </p>
      </div>

      {/* Main Garden Visual */}
      <div className={`bg-gradient-to-br ${stageInfo.color} rounded-xl shadow-xl p-8 mb-8 text-white`}>
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">
            {getStageEmoji(userStats.stage)}
          </div>
          <h2 className="text-4xl font-bold mb-2">{stageInfo.title}</h2>
          <p className="text-xl opacity-90 mb-4">{stageInfo.description}</p>
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-6 py-2">
            <span className="font-medium">{stageInfo.range}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-600">Level</span>
          </div>
          <p className="text-4xl font-bold text-gray-800">{userStats.level}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-600">Impact Points</span>
          </div>
          <p className="text-4xl font-bold text-gray-800">{userStats.totalImpactPoints}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600">Quests Done</span>
          </div>
          <p className="text-4xl font-bold text-gray-800">{userStats.completedQuests}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-600">Member Since</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{memberSince}</p>
        </div>
      </div>

      {/* Progress Section */}
      {userStats.totalImpactPoints < 600 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Growth Progress</h3>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Current: {userStats.totalImpactPoints} points</span>
              <span className="text-gray-600">Next Stage: {nextStagePoints()} points</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressToNext()}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {nextStagePoints() - userStats.totalImpactPoints} more points to reach the next stage!
          </p>
        </div>
      )}

      {/* All Stages Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Growth Journey</h3>
        <div className="space-y-4">
          {[
            { stage: 'seedling', emoji: '🌱', title: 'Seedling', range: '0-100 pts', desc: 'Just starting your impact journey' },
            { stage: 'sprout', emoji: '🌿', title: 'Sprout', range: '100-300 pts', desc: 'Growing your green footprint' },
            { stage: 'tree', emoji: '🌳', title: 'Tree', range: '300-600 pts', desc: 'Making substantial impact' },
            { stage: 'forest', emoji: '🌲', title: 'Forest', range: '600+ pts', desc: 'Champion of environmental action' },
          ].map((item) => (
            <div
              key={item.stage}
              className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                userStats.stage === item.stage
                  ? 'bg-green-50 border-2 border-green-500'
                  : 'bg-gray-50'
              }`}
            >
              <span className="text-4xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800">{item.title}</span>
                  <span className="text-sm text-gray-500">({item.range})</span>
                  {userStats.stage === item.stage && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      {userStats.completedQuests === 0 && (
        <div className="mt-8 text-center p-8 bg-blue-50 rounded-lg border-2 border-blue-200">
          <Award className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Ready to grow your garden?</h3>
          <p className="text-gray-600 mb-4">Complete your first quest to start your impact journey!</p>
          <button
            onClick={() => router.push('/dashboard/quests')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse Quests
          </button>
        </div>
      )}
    </div>
  );
}
