'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Award, User, Search, Filter, Sparkles } from 'lucide-react';
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
  CircularProgress,
} from '@/components/ui';

// Dynamic import for map to avoid SSR issues
const QuestMap = dynamic(() => import('@/components/QuestMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#31087B]/20">
      <LoadingSpinner size="md" color="primary" label="Loading map..." />
    </div>
  ),
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
      setQuests(data.quests?.filter((q: Quest) => q !== null) || []);
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

  const categories = ['all', 'cleanup', 'planting', 'recycling', 'education', 'other'];

  const filteredQuests = quests.filter(quest => {
    const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, 'primary' | 'success' | 'secondary' | 'warning'> = {
      cleanup: 'primary',
      planting: 'success',
      recycling: 'secondary',
      education: 'warning',
      other: 'primary',
    };
    return colors[category] || 'primary';
  };

  const getStageInfo = (stage: string) => {
    const stages: Record<string, { icon: string; title: string; color: 'primary' | 'success' | 'warning' | 'secondary' }> = {
      seedling: { icon: '🌱', title: 'Seedling', color: 'success' },
      sprout: { icon: '🌿', title: 'Sprout', color: 'success' },
      tree: { icon: '🌳', title: 'Tree', color: 'primary' },
      forest: { icon: '🌲', title: 'Forest', color: 'warning' },
    };
    return stages[stage] || stages.seedling;
  };

  const stageInfo = getStageInfo(userStats.stage);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Container className="py-6">
        <PageHeader
          title="Quest Hub"
          description="Discover and complete environmental quests near you"
        />

        {/* Tabs */}
        <div className="bg-[#31087B]/30 backdrop-blur-md rounded-lg border border-[#FA2FB5]/20 mb-6">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => setActiveTab('quests')}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${
                activeTab === 'quests'
                  ? 'bg-[#FA2FB5] text-white'
                  : 'text-gray-400 hover:text-[#FA2FB5]'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Nearby Quests
            </button>
            <button
              onClick={() => setActiveTab('garden')}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${
                activeTab === 'garden'
                  ? 'bg-[#FA2FB5] text-white'
                  : 'text-gray-400 hover:text-[#FA2FB5]'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              My Garden
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'quests' && (
          <>
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search quests..."
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
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
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
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quest List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Available Quests</h2>
                  <Badge variant="primary">{filteredQuests.length}</Badge>
                </div>
                
                {loading ? (
                  <Card>
                    <CardBody className="py-12 text-center">
                      <LoadingSpinner size="lg" color="primary" label="Loading quests..." />
                    </CardBody>
                  </Card>
                ) : filteredQuests.length === 0 ? (
                  <Card>
                    <CardBody className="py-12 text-center">
                      <p className="text-gray-400 mb-4">No quests found</p>
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
                            
                            <Badge variant={getCategoryColor(quest.category)} className="capitalize">
                              {quest.category}
                            </Badge>
                          </CardBody>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="lg:sticky lg:top-24 h-[500px] lg:h-[calc(100vh-180px)]">
                <Card className="h-full">
                  <CardBody className="p-0 h-full">
                    <QuestMap quests={filteredQuests} onQuestClick={handleQuestClick} />
                  </CardBody>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === 'garden' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="mb-6 bg-gradient-to-br from-[#31087B] to-[#100720] border-2 border-[#FA2FB5]/50">
              <CardBody className="text-center py-12">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-block mb-6"
                >
                  <div className="text-8xl filter drop-shadow-lg">
                    {stageInfo.icon}
                  </div>
                </motion.div>
                
                <h2 className="text-4xl font-bold text-white mb-3">
                  {stageInfo.title}
                </h2>
                <Badge variant={stageInfo.color} className="text-base px-4 py-2">
                  My Current Stage
                </Badge>
              </CardBody>
            </Card>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { icon: Award, label: 'Level', value: userStats.level, color: 'warning' as const, progress: userStats.level * 10 },
                { icon: Sparkles, label: 'Impact Points', value: userStats.totalImpactPoints, color: 'primary' as const, progress: Math.min(100, (userStats.totalImpactPoints / 600) * 100) },
                { icon: MapPin, label: 'Quests Done', value: userStats.completedQuests, color: 'success' as const, progress: userStats.completedQuests * 10 },
                { icon: User, label: 'Stage', value: stageInfo.title, color: stageInfo.color, progress: 100 },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardBody>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-3 bg-[#FA2FB5]/20 rounded-lg">
                          <stat.icon className="w-6 h-6 text-[#FA2FB5]" />
                        </div>
                        <CircularProgress
                          value={stat.progress}
                          size="sm"
                          color={stat.color}
                        />
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Growth Journey */}
            <Card>
              <CardBody>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#FA2FB5]" />
                  Your Growth Journey
                </h3>
                
                <div className="space-y-3">
                  {[
                    { stage: 'seedling', title: 'Seedling', range: '0-100 pts', desc: 'Just starting your impact journey', icon: '🌱' },
                    { stage: 'sprout', title: 'Sprout', range: '100-300 pts', desc: 'Growing your green footprint', icon: '🌿' },
                    { stage: 'tree', title: 'Tree', range: '300-600 pts', desc: 'Making substantial impact', icon: '🌳' },
                    { stage: 'forest', title: 'Forest', range: '600+ pts', desc: 'Champion of environmental action', icon: '🌲' },
                  ].map((item, index) => {
                    const isCurrent = userStats.stage === item.stage;
                    const isCompleted = ['seedling', 'sprout', 'tree', 'forest'].indexOf(userStats.stage) > index;
                    
                    return (
                      <motion.div
                        key={item.stage}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all border-2 ${
                          isCurrent
                            ? 'bg-gradient-to-r from-[#FA2FB5]/20 to-[#31087B]/20 border-[#FA2FB5]'
                            : isCompleted
                            ? 'bg-[#31087B]/30 border-[#FFC23C]/30'
                            : 'bg-[#100720]/50 border-[#31087B]'
                        }`}
                      >
                        <div className="text-4xl">{item.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{item.title}</span>
                            <Badge variant="secondary" className="text-xs">{item.range}</Badge>
                            {isCurrent && <Badge variant="primary" className="text-xs">Current</Badge>}
                            {isCompleted && <Badge variant="success" className="text-xs">✓</Badge>}
                          </div>
                          <p className="text-sm text-gray-300">{item.desc}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {userStats.completedQuests === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <Card className="bg-gradient-to-r from-[#31087B]/50 to-[#FA2FB5]/30 border-2 border-[#FA2FB5]">
                  <CardBody className="text-center py-8">
                    <Award className="w-16 h-16 text-[#FFC23C] mx-auto mb-4" />
                    <h3 className="font-bold text-2xl mb-2 text-white">Ready to make your first impact?</h3>
                    <p className="text-gray-300 mb-6">Complete your first quest to start growing your garden!</p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setActiveTab('quests')}
                    >
                      Browse Quests
                    </Button>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </Container>
    </div>
  );
}
