'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import dynamic from 'next/dynamic';
import { MapPin, Filter } from 'lucide-react';

// Dynamic import for map to avoid SSR issues
const QuestMap = dynamic(() => import('@/components/QuestMap'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">Loading map...</div>,
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
  isActive?: boolean;
}

export default function BrowseQuests() {
  const router = useRouter();
  const { address } = useAccount();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuests();
  }, []);

  useEffect(() => {
    if (address) {
      fetchCompletedQuests();
    }
  }, [address]);

  const fetchQuests = async () => {
    try {
      const response = await fetch('/api/quests');
      const data = await response.json();
      setQuests(data.quests?.filter((q: Quest) => q.isActive !== false) || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedQuests = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/submissions?walletAddress=${address}&verified=true`);
      const data = await response.json();
      
      if (data.success && data.submissions) {
        const completedIds = new Set<string>(
          data.submissions.map((sub: any) => {
            const id = typeof sub.questId === 'string' ? sub.questId : sub.questId?._id;
            return id;
          }).filter(Boolean)
        );
        setCompletedQuestIds(completedIds);
      }
    } catch (error) {
      console.error('Error fetching completed quests:', error);
    }
  };

  const handleQuestClick = (questId: string) => {
    router.push(`/quest/${questId}`);
  };

  const categories = ['all', 'cleanup', 'planting', 'recycling', 'education', 'other'];
  
  const filteredQuests = selectedCategory === 'all' 
    ? quests 
    : quests.filter(q => q.category === selectedCategory);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Quests</h1>
        <p className="text-gray-300">Find environmental challenges near you</p>
      </div>

      {/* Category Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-4 mb-6 border-2 border-[#FA2FB5]/30">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-[#FFC23C]" />
          <span className="font-medium text-white">Filter by Category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all shadow-lg ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-[#FA2FB5]/30'
              }`}
            >
              {cat} {cat === 'all' && `(${quests.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 320px)' }}>
        {/* Quest List */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl p-4 overflow-y-auto border-2 border-[#FA2FB5]/30">
          <h2 className="text-xl font-bold mb-4 text-white">
            Available Quests ({filteredQuests.length})
            {completedQuestIds.size > 0 && (
              <span className="ml-2 text-sm text-green-400">
                • {completedQuestIds.size} completed
              </span>
            )}
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA2FB5] mx-auto mb-4"></div>
              <p className="text-gray-300">Loading quests...</p>
            </div>
          ) : filteredQuests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="mb-2">No quests found in this category</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[#FA2FB5] hover:text-[#FFC23C] transition-colors"
              >
                View all quests
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuests.map((quest) => (
                <div
                  key={quest._id}
                  onClick={() => handleQuestClick(quest._id)}
                  className={`bg-white/5 border-2 rounded-lg p-4 hover:bg-white/10 hover:shadow-xl transition-all cursor-pointer ${
                    completedQuestIds.has(quest._id)
                      ? 'border-green-500/50 opacity-60'
                      : 'border-[#FA2FB5]/20 hover:border-[#FA2FB5]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white">{quest.title}</h3>
                    <div className="flex gap-2 items-center ml-2">
                      {completedQuestIds.has(quest._id) && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                          ✓ Completed
                        </span>
                      )}
                      <span className="bg-gradient-to-r from-[#FFC23C] to-[#FA2FB5] text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        +{quest.impactPoints} pts
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{quest.description}</p>
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1 text-[#FFC23C]" />
                    <span className="line-clamp-1">{quest.location.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-[#31087B]/50 text-[#FFC23C] px-2 py-1 rounded text-xs font-medium capitalize border border-[#FFC23C]/30">
                      {quest.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border-2 border-[#FA2FB5]/30">
          <QuestMap quests={filteredQuests} onQuestClick={handleQuestClick} />
        </div>
      </div>
    </div>
  );
}
