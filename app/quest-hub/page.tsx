'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Award, User, ArrowLeft } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Dynamic import for map to avoid SSR issues
const QuestMap = dynamic(() => import('@/components/QuestMap'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center">Loading map...</div>,
});

interface Quest {
  _id: string;
  title: string;
  description: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  category: string;
  impactPoints: number;
  imageUrl?: string;
}

export default function QuestHub() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'quests' | 'garden'>('quests');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    level: 1,
    totalImpactPoints: 0,
    completedQuests: 0,
    stage: 'seedling',
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (address) {
      fetchQuests();
      fetchUserStats();
    }
  }, [address]);

  const fetchQuests = async () => {
    try {
      const response = await fetch('/api/quests');
      const data = await response.json();
      setQuests(data.quests || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/user/${address}`);
      const data = await response.json();
      if (data.user) {
        setUserStats(data.user);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleQuestClick = (questId: string) => {
    router.push(`/quest/${questId}`);
  };

  if (!isConnected) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-green-600">Quest Hub</h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('quests')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'quests'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Nearby Quests
            </button>
            <button
              onClick={() => setActiveTab('garden')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'garden'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              My Garden
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'quests' && (
          <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Quest List */}
            <div className="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Available Quests</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading quests...</div>
              ) : quests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No quests available yet. Check back soon!
                </div>
              ) : (
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <div
                      key={quest._id}
                      onClick={() => handleQuestClick(quest._id)}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{quest.title}</h3>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          +{quest.impactPoints} pts
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{quest.description}</p>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {quest.location.address}
                      </div>
                      <div className="mt-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {quest.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <QuestMap quests={quests} onQuestClick={handleQuestClick} />
            </div>
          </div>
        )}

        {activeTab === 'garden' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                🌱 My Impact Garden
              </h2>
              
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{userStats.level}</div>
                  <div className="text-gray-600 mt-1">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{userStats.totalImpactPoints}</div>
                  <div className="text-gray-600 mt-1">Impact Points</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{userStats.completedQuests}</div>
                  <div className="text-gray-600 mt-1">Quests Done</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl">
                    {userStats.stage === 'seedling' && '🌱'}
                    {userStats.stage === 'sprout' && '🌿'}
                    {userStats.stage === 'tree' && '🌳'}
                    {userStats.stage === 'forest' && '🌲'}
                  </div>
                  <div className="text-gray-600 mt-1 capitalize">{userStats.stage}</div>
                </div>
              </div>

              {/* Progression */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Your Growth Journey</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🌱</span>
                    <div className="flex-1">
                      <div className="font-medium">Seedling (0-100 pts)</div>
                      <div className="text-sm text-gray-600">Just starting your impact journey</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🌿</span>
                    <div className="flex-1">
                      <div className="font-medium">Sprout (100-300 pts)</div>
                      <div className="text-sm text-gray-600">Growing your green footprint</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🌳</span>
                    <div className="flex-1">
                      <div className="font-medium">Tree (300-600 pts)</div>
                      <div className="text-sm text-gray-600">Making substantial impact</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🌲</span>
                    <div className="flex-1">
                      <div className="font-medium">Forest (600+ pts)</div>
                      <div className="text-sm text-gray-600">Champion of environmental action</div>
                    </div>
                  </div>
                </div>
              </div>

              {userStats.completedQuests === 0 && (
                <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
                  <Award className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2">Ready to make your first impact?</h3>
                  <p className="text-gray-600 mb-4">Complete your first quest to start growing your garden!</p>
                  <button
                    onClick={() => setActiveTab('quests')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                  >
                    Browse Quests
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
