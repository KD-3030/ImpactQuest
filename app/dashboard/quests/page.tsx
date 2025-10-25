'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchQuests();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Browse Quests</h1>
        <p className="text-gray-600">Find environmental challenges near you</p>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Filter by Category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        <div className="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Available Quests ({filteredQuests.length})
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quests...</p>
            </div>
          ) : filteredQuests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-2">No quests found in this category</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-green-600 hover:underline"
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
                  className="border rounded-lg p-4 hover:shadow-lg hover:border-green-500 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{quest.title}</h3>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-2">
                      +{quest.impactPoints} pts
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{quest.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="line-clamp-1">{quest.location.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium capitalize">
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
          <QuestMap quests={filteredQuests} onQuestClick={handleQuestClick} />
        </div>
      </div>
    </div>
  );
}
