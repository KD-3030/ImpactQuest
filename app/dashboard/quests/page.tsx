'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Filter, Search, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Container,
  PageHeader,
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  LoadingSpinner,
} from '@/components/ui';

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
  const [searchQuery, setSearchQuery] = useState('');

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
  
  const filteredQuests = quests.filter(quest => {
    const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cleanup: 'primary',
      planting: 'success',
      recycling: 'secondary',
      education: 'warning',
      other: 'primary',
    };
    return colors[category] || 'primary';
  };

  return (
    <Container>
      <PageHeader
        title="Browse Quests"
        description="Discover environmental challenges and earn impact points"
      />

      {/* Search and Filters */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search quests by title, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#FA2FB5] flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 bg-[#31087B]/30 border border-[#FA2FB5]/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#FA2FB5] transition-all capitalize"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#100720] capitalize">
                {cat} {cat === 'all' && `(${quests.length})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="capitalize"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading quests..." />
          </CardBody>
        </Card>
      ) : filteredQuests.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-gray-400 mb-4">
              {searchQuery ? 'No quests match your search' : 'No quests found in this category'}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quest List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Available Quests
              </h2>
              <Badge variant="primary">{filteredQuests.length}</Badge>
            </div>
            
            <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
              {filteredQuests.map((quest, index) => (
                <motion.div
                  key={quest._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleQuestClick(quest._id)}
                  className="cursor-pointer"
                >
                  <Card hover>
                    <CardBody>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-white flex-1">
                          {quest.title}
                        </h3>
                        <div className="flex items-center gap-1 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ml-3">
                          <Award className="w-4 h-4" />
                          {quest.impactPoints}
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {quest.description}
                      </p>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1 text-[#FFC23C] flex-shrink-0" />
                        <span className="line-clamp-1">{quest.location.address}</span>
                      </div>
                      
                      <Badge variant={getCategoryColor(quest.category) as any} className="capitalize">
                        {quest.category}
                      </Badge>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-6 h-[500px] lg:h-[calc(100vh-250px)]">
            <Card className="h-full">
              <CardBody className="p-0 h-full">
                <QuestMap quests={filteredQuests} onQuestClick={handleQuestClick} />
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </Container>
  );
}
