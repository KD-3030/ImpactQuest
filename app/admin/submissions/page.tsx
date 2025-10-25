'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Eye, User, MapPin, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
  userId: {
    _id: string;
    walletAddress: string;
    level: number;
    totalImpactPoints: number;
  };
  questId: {
    _id: string;
    title: string;
    impactPoints: number;
  };
  imageUrl: string;
  verified: boolean;
  aiResponse?: string;
  impactPointsEarned: number;
  submittedAt: string;
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/submissions?status=${filter}`);
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

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this submission? User will receive impact points.')) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      });

      const data = await response.json();

      if (data.success) {
        fetchSubmissions(); // Refresh list
      } else {
        alert(data.error || 'Failed to approve submission');
      }
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this submission? This action cannot be undone.')) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: false }),
      });

      const data = await response.json();

      if (data.success) {
        fetchSubmissions(); // Refresh list
      } else {
        alert(data.error || 'Failed to reject submission');
      }
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission permanently? This cannot be undone.')) return;

    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSubmissions(); // Refresh list
      } else {
        alert('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('An error occurred');
    } finally {
      setProcessingId(null);
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

  const formatWallet = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const pendingCount = submissions.filter(s => !s.verified).length;
  const verifiedCount = submissions.filter(s => s.verified).length;

  return (
    <Container>
      <PageHeader
        title="Quest Submissions"
        description="Review and approve user quest submissions"
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({submissions.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === 'verified' ? 'primary' : 'outline'}
          onClick={() => setFilter('verified')}
        >
          Verified ({verifiedCount})
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading submissions..." />
          </CardBody>
        </Card>
      ) : submissions.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-gray-400">No submissions found</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission, index) => (
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
                    <div className="lg:w-64 flex-shrink-0">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-[#31087B]/30 cursor-pointer group">
                        <Image
                          src={submission.imageUrl}
                          alt="Submission proof"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          onClick={() => setPreviewImage(submission.imageUrl)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>

                    {/* Submission Details */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {submission.questId.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {formatWallet(submission.userId.walletAddress)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              Level {submission.userId.level}
                            </span>
                            <span>
                              {formatDate(submission.submittedAt)}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={submission.verified ? 'success' : 'warning'}
                          className="self-start"
                        >
                          {submission.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>

                      {/* Points Info */}
                      <div className="bg-[#31087B]/30 rounded-lg p-4 border border-[#FA2FB5]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Impact Points</span>
                          <span className="text-2xl font-bold text-[#FFC23C]">
                            {submission.questId.impactPoints}
                          </span>
                        </div>
                        {submission.verified && (
                          <p className="text-sm text-green-400 mt-1">
                            ✓ Points awarded
                          </p>
                        )}
                      </div>

                      {/* AI Response */}
                      {submission.aiResponse && (
                        <div className="bg-[#100720]/50 rounded-lg p-4 border border-[#31087B]">
                          <p className="text-sm text-gray-300">
                            <span className="font-semibold text-[#FA2FB5]">AI Analysis:</span>{' '}
                            {submission.aiResponse}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {!submission.verified ? (
                          <>
                            <Button
                              variant="success"
                              icon={CheckCircle}
                              onClick={() => handleApprove(submission._id)}
                              loading={processingId === submission._id}
                              disabled={processingId !== null}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              icon={XCircle}
                              onClick={() => handleReject(submission._id)}
                              loading={processingId === submission._id}
                              disabled={processingId !== null}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="cursor-not-allowed"
                          >
                            Already Verified
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          icon={Trash2}
                          onClick={() => handleDelete(submission._id)}
                          loading={processingId === submission._id}
                          disabled={processingId !== null}
                          className="ml-auto"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <Image
              src={previewImage}
              alt="Preview"
              fill
              className="object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      )}
    </Container>
  );
}
