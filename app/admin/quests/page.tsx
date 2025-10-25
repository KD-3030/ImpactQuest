'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, MapPin, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container, PageHeader, Card, CardBody, Button, Badge, Input, LoadingSpinner } from '@/components/ui';

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
  isActive: boolean;
  blockchainQuestId?: number;
  createdAt: string;
}

export default function ManageQuests() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQuests();
  }, []);

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

  const handleDelete = async (questId: string) => {
    if (!confirm('Are you sure you want to delete this quest?')) return;

    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuests(quests.filter(q => q._id !== questId));
        alert('Quest deleted successfully!');
      } else {
        alert('Failed to delete quest');
      }
    } catch (error) {
      console.error('Error deleting quest:', error);
      alert('Error deleting quest');
    }
  };

  const handleToggleActive = async (questId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setQuests(quests.map(q => 
          q._id === questId ? { ...q, isActive: !currentStatus } : q
        ));
      } else {
        alert('Failed to update quest status');
      }
    } catch (error) {
      console.error('Error toggling quest status:', error);
    }
  };

  const filteredQuests = quests.filter(q => {
    const matchesFilter = filter === 'all' ? true : filter === 'active' ? q.isActive : !q.isActive;
    const matchesSearch = searchQuery === '' || 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cleanup: 'primary',
      planting: 'success',
      recycling: 'info',
      education: 'secondary',
      other: 'warning',
    };
    return colors[category] || 'primary';
  };

  return (
    <Container>
      <PageHeader
        title="Manage Quests"
        description="View, edit, and manage all environmental quests"
        action={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => router.push('/admin/create-quest')}
          >
            Create New Quest
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({quests.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'success' : 'outline'}
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active ({quests.filter(q => q.isActive).length})
              </Button>
              <Button
                variant={filter === 'inactive' ? 'outline' : 'outline'}
                size="sm"
                onClick={() => setFilter('inactive')}
              >
                Inactive ({quests.filter(q => !q.isActive).length})
              </Button>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Search quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quests List */}
      {loading ? (
        <Card>
          <CardBody className="text-center py-12">
            <LoadingSpinner size="lg" color="primary" label="Loading quests..." />
          </CardBody>
        </Card>
      ) : filteredQuests.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-300 mb-4">
              {searchQuery ? 'No quests match your search' : 'No quests found'}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/admin/create-quest')}
            >
              Create Your First Quest
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Quest</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Points</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredQuests.map((quest, index) => (
                      <motion.tr
                        key={quest._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{quest.title}</div>
                            <div className="text-sm text-gray-400 line-clamp-1">{quest.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getCategoryColor(quest.category) as any} size="sm">
                            {quest.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-[#FFC23C]">+{quest.impactPoints}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{quest.location.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(quest._id, quest.isActive)}
                            className="flex items-center gap-2 transition-colors"
                          >
                            {quest.isActive ? (
                              <>
                                <ToggleRight className="w-6 h-6 text-green-500" />
                                <span className="text-green-500 font-medium">Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-6 h-6 text-gray-500" />
                                <span className="text-gray-500">Inactive</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/edit-quest/${quest._id}`)}
                              className="p-2 text-[#FA2FB5] hover:bg-[#FA2FB5]/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(quest._id)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredQuests.map((quest, index) => (
              <motion.div
                key={quest._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover>
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">{quest.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{quest.description}</p>
                      </div>
                      <button
                        onClick={() => handleToggleActive(quest._id, quest.isActive)}
                        className="ml-2 flex-shrink-0"
                      >
                        {quest.isActive ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant={getCategoryColor(quest.category) as any} size="sm">
                        {quest.category}
                      </Badge>
                      <Badge variant="primary" size="sm">
                        +{quest.impactPoints} pts
                      </Badge>
                      {quest.blockchainQuestId && (
                        <Badge variant="success" size="sm">
                          On-Chain #{quest.blockchainQuestId}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{quest.location.address}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit}
                        onClick={() => router.push(`/admin/edit-quest/${quest._id}`)}
                        fullWidth
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDelete(quest._id)}
                        fullWidth
                      >
                        Delete
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
