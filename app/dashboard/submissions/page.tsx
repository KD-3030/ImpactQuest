'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Calendar, Award, MapPin, Eye, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  PageHeader,
  Card,
  CardBody,
  Button,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

interface Submission {
  _id: string;
  questId: {
    _id: string;
    title: string;
    impactPoints: number;
    category: string;
    location: {
      address: string;
    };
  } | null;
  imageUrl: string;
  verified: boolean;
  aiResponse?: string;
  impactPointsEarned: number;
  submittedAt: string;
}

export default function MySubmissions() {
  const { address } = useAccount();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchSubmissions();
    }
  }, [address]);

  const fetchSubmissions = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${address}/submissions`);
      const data = await response.json();
      
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    if (filter === 'verified') return submission.verified;
    if (filter === 'pending') return !submission.verified;
    return true;
  });

  const verifiedCount = submissions.filter(s => s.verified).length;
  const pendingCount = submissions.filter(s => !s.verified).length;
  const totalPoints = submissions.reduce((sum, s) => sum + s.impactPointsEarned, 0);

  if (!address) {
    return (
      <Container>
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-gray-400 mb-4">Please connect your wallet to view submissions</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Connect Wallet
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="My Submissions"
        description="Track your quest completions and earned points"
      />

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-[#FA2FB5]/20 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-[#FA2FB5]" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Total Submissions</p>
              <p className="text-3xl font-bold text-white">{submissions.length}</p>
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
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Verified</p>
              <p className="text-3xl font-bold text-white">{verifiedCount}</p>
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
                <div className="p-3 bg-[#FFC23C]/20 rounded-lg">
                  <XCircle className="w-6 h-6 text-[#FFC23C]" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">Pending</p>
              <p className="text-3xl font-bold text-white">{pendingCount}</p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-[#FA2FB5]/20 to-[#FFC23C]/20 border-2 border-[#FFC23C]">
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-[#FFC23C]/30 rounded-lg">
                  <Award className="w-6 h-6 text-[#FFC23C]" />
                </div>
                <Sparkles className="w-5 h-5 text-[#FFC23C]" />
              </div>
              <p className="text-sm text-gray-300 mb-1">Points Earned</p>
              <p className="text-3xl font-bold text-white">{totalPoints}</p>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({submissions.length})
        </Button>
        <Button
          variant={filter === 'verified' ? 'primary' : 'outline'}
          onClick={() => setFilter('verified')}
        >
          Verified ({verifiedCount})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading your submissions..." />
          </CardBody>
        </Card>
      ) : filteredSubmissions.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't submitted any quests yet" 
                : `No ${filter} submissions`}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/quests')}
            >
              Browse Quests
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission, index) => {
            // Skip rendering if quest was deleted
            if (!submission.questId) {
              return null;
            }

            return (
              <motion.div
                key={submission._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card>
                  <CardBody>
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Image Preview */}
                      <div className="lg:w-48 flex-shrink-0">
                        <div 
                          className="relative aspect-square rounded-lg overflow-hidden bg-[#31087B]/30 cursor-pointer group"
                          onClick={() => setPreviewImage(submission.imageUrl)}
                        >
                          <img
                            src={submission.imageUrl}
                            alt="Submission proof"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          {submission.verified ? (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:items-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {submission.questId.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(submission.submittedAt)}
                            </span>
                            <Badge 
                              variant={getCategoryColor(submission.questId.category)}
                              className="capitalize"
                            >
                              {submission.questId.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Points Display */}
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white px-4 py-2 rounded-full font-bold shadow-lg">
                          <Award className="w-5 h-5" />
                          {submission.verified 
                            ? `+${submission.impactPointsEarned}` 
                            : submission.questId.impactPoints}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-400 text-sm bg-[#100720]/50 p-3 rounded-lg">
                        <MapPin className="w-4 h-4 text-[#FFC23C] flex-shrink-0" />
                        <span>{submission.questId.location.address}</span>
                      </div>

                      {/* AI Response */}
                      {submission.aiResponse && (
                        <div className="bg-[#31087B]/30 rounded-lg p-4 border border-[#FA2FB5]/20">
                          <p className="text-sm text-gray-300">
                            <span className="font-semibold text-[#FA2FB5]">AI Analysis:</span>{' '}
                            {submission.aiResponse}
                          </p>
                        </div>
                      )}

                      {/* Status Message */}
                      {submission.verified ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <p className="text-sm text-green-400 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Quest verified! Points have been added to your garden.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-[#FFC23C]/10 border border-[#FFC23C]/30 rounded-lg p-3">
                          <p className="text-sm text-[#FFC23C] flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Waiting for admin verification
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/quest/${submission.questId?._id || ''}`)}
                        >
                          View Quest Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
