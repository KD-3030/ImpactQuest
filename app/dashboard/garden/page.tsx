'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Award, TrendingUp, Target, Calendar, Sprout, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  PageHeader,
  Card,
  CardBody,
  Button,
  Badge,
  LoadingSpinner,
  CircularProgress,
} from '@/components/ui';

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

  const getStageInfo = (stage: string) => {
    const stages: Record<string, { title: string; description: string; range: string; icon: string; color: 'primary' | 'success' | 'warning' | 'secondary' }> = {
      seedling: {
        title: 'Seedling',
        description: 'Just starting your impact journey',
        range: '0-100 points',
        icon: '🌱',
        color: 'success',
      },
      sprout: {
        title: 'Sprout',
        description: 'Growing your green footprint',
        range: '100-300 points',
        icon: '🌿',
        color: 'success',
      },
      tree: {
        title: 'Tree',
        description: 'Making substantial impact',
        range: '300-600 points',
        icon: '🌳',
        color: 'primary',
      },
      forest: {
        title: 'Forest',
        description: 'Champion of environmental action',
        range: '600+ points',
        icon: '🌲',
        color: 'warning',
      },
    };
    return stages[stage] || stages.seedling;
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

  const allStages = [
    { stage: 'seedling', title: 'Seedling', range: '0-100', desc: 'Just starting your impact journey', icon: '🌱' },
    { stage: 'sprout', title: 'Sprout', range: '100-300', desc: 'Growing your green footprint', icon: '🌿' },
    { stage: 'tree', title: 'Tree', range: '300-600', desc: 'Making substantial impact', icon: '🌳' },
    { stage: 'forest', title: 'Forest', range: '600+', desc: 'Champion of environmental action', icon: '🌲' },
  ];

  if (loading) {
    return (
      <Container>
        <Card>
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading your garden..." />
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="My Impact Garden"
        description="Track your environmental impact and watch your garden grow"
        action={
          <Badge variant={stageInfo.color} className="text-lg px-4 py-2">
            {stageInfo.icon} {stageInfo.title}
          </Badge>
        }
      />

      {/* Main Garden Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
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
            <p className="text-xl text-gray-300 mb-4">
              {stageInfo.description}
            </p>
            <Badge variant="secondary" className="text-base px-4 py-2">
              {stageInfo.range}
            </Badge>

            {/* Sparkle Effects */}
            <div className="flex justify-center gap-4 mt-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#FFC23C]" />
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-[#FFC23C]/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[#FFC23C]" />
                </div>
                <CircularProgress
                  value={userStats.level * 10}
                  size="sm"
                  color="warning"
                />
              </div>
              <p className="text-sm text-gray-400 mb-1">Level</p>
              <p className="text-3xl font-bold text-white">{userStats.level}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-[#FA2FB5]/20 rounded-lg">
                  <Award className="w-6 h-6 text-[#FA2FB5]" />
                </div>
                <CircularProgress
                  value={Math.min(100, (userStats.totalImpactPoints / 600) * 100)}
                  size="sm"
                  color="primary"
                />
              </div>
              <p className="text-sm text-gray-400 mb-1">Impact Points</p>
              <p className="text-3xl font-bold text-white">{userStats.totalImpactPoints}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-[#31087B]/40 rounded-lg">
                  <Target className="w-6 h-6 text-[#FFC23C]" />
                </div>
                <Badge variant="success">{userStats.completedQuests}</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-1">Quests Completed</p>
              <p className="text-3xl font-bold text-white">{userStats.completedQuests}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-[#FFC23C]/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-[#FFC23C]" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Member Since</p>
              <p className="text-lg font-bold text-white">{memberSince}</p>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Progress Section */}
      {userStats.totalImpactPoints < 600 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardBody>
              <div className="flex items-center gap-3 mb-4">
                <Sprout className="w-6 h-6 text-[#FFC23C]" />
                <h3 className="text-xl font-bold text-white">Growth Progress</h3>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Current: <span className="text-white font-semibold">{userStats.totalImpactPoints}</span> points
                  </span>
                  <span className="text-gray-400">
                    Next: <span className="text-[#FFC23C] font-semibold">{nextStagePoints()}</span> points
                  </span>
                </div>
                
                <div className="relative w-full bg-[#100720] rounded-full h-6 border border-[#FA2FB5]/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] rounded-full"
                  />
                  <div className="relative flex items-center justify-center h-full">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {Math.round(progressToNext())}%
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FFC23C]" />
                <span className="font-semibold text-[#FFC23C]">
                  {nextStagePoints() - userStats.totalImpactPoints}
                </span>
                more points to reach the next stage!
              </p>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* All Stages Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardBody>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-[#FA2FB5]" />
              Your Growth Journey
            </h3>
            
            <div className="space-y-3">
              {allStages.map((item, index) => {
                const isCurrent = userStats.stage === item.stage;
                const isCompleted = allStages.findIndex(s => s.stage === userStats.stage) > index;
                
                return (
                  <motion.div
                    key={item.stage}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all border-2 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#FA2FB5]/20 to-[#31087B]/20 border-[#FA2FB5]'
                        : isCompleted
                        ? 'bg-[#31087B]/30 border-[#FFC23C]/30'
                        : 'bg-[#100720]/50 border-[#31087B]'
                    }`}
                  >
                    <div className="text-4xl">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{item.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.range} pts
                        </Badge>
                        {isCurrent && (
                          <Badge variant="primary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="success" className="text-xs">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Call to Action */}
      {userStats.completedQuests === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-r from-[#31087B]/50 to-[#FA2FB5]/30 border-2 border-[#FA2FB5]">
            <CardBody className="text-center py-8">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Award className="w-16 h-16 text-[#FFC23C] mx-auto mb-4" />
              </motion.div>
              <h3 className="font-bold text-2xl mb-2 text-white">Ready to grow your garden?</h3>
              <p className="text-gray-300 mb-6">Complete your first quest to start your impact journey!</p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard/quests')}
              >
                Browse Quests
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </Container>
  );
}
