'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';

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
  createdAt: string;
}

export default function ManageQuests() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

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
    if (filter === 'active') return q.isActive;
    if (filter === 'inactive') return !q.isActive;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Quests</h1>
          <p className="text-gray-600">View, edit, and manage all environmental quests</p>
        </div>
        <button
          onClick={() => router.push('/admin/create-quest')}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Quest
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({quests.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active ({quests.filter(q => q.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactive ({quests.filter(q => !q.isActive).length})
          </button>
        </div>
      </div>

      {/* Quests Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quests...</p>
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 mb-4">No quests found</p>
          <button
            onClick={() => router.push('/admin/create-quest')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First Quest
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quest</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Points</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredQuests.map((quest) => (
                  <tr key={quest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-800">{quest.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{quest.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium capitalize">
                        {quest.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600">+{quest.impactPoints}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{quest.location.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(quest._id, quest.isActive)}
                        className="flex items-center gap-2"
                      >
                        {quest.isActive ? (
                          <>
                            <ToggleRight className="w-6 h-6 text-green-600" />
                            <span className="text-green-600 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                            <span className="text-gray-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/edit-quest/${quest._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(quest._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
