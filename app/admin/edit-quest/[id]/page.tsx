'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

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
  verificationPrompt: string;
  isActive: boolean;
}

export default function EditQuest({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quest, setQuest] = useState<Quest | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'cleanup',
    impactPoints: 50,
    address: '',
    latitude: '',
    longitude: '',
    verificationPrompt: '',
    isActive: true,
  });

  useEffect(() => {
    fetchQuest();
  }, [params.id]);

  const fetchQuest = async () => {
    try {
      const response = await fetch(`/api/quests/${params.id}`);
      const data = await response.json();
      
      if (data.quest) {
        const q = data.quest;
        setQuest(q);
        setFormData({
          title: q.title,
          description: q.description,
          category: q.category,
          impactPoints: q.impactPoints,
          address: q.location.address,
          latitude: q.location.coordinates[1].toString(),
          longitude: q.location.coordinates[0].toString(),
          verificationPrompt: q.verificationPrompt,
          isActive: q.isActive ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching quest:', error);
      alert('Failed to load quest');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/quests/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          impactPoints: Number(formData.impactPoints),
          location: {
            type: 'Point',
            coordinates: [Number(formData.longitude), Number(formData.latitude)],
            address: formData.address,
          },
          verificationPrompt: formData.verificationPrompt,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Quest updated successfully!');
        router.push('/admin/quests');
      } else {
        alert(data.error || 'Failed to update quest');
      }
    } catch (error) {
      console.error('Error updating quest:', error);
      alert('An error occurred while updating the quest');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading quest...</p>
        </div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Quest not found</p>
          <button
            onClick={() => router.push('/admin/quests')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Quests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/quests')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Quest</h1>
          <p className="text-gray-600 mt-1">Update quest details and settings</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Active Status Toggle */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-medium text-gray-900">Quest Active Status</span>
                <p className="text-sm text-gray-600">Enable or disable this quest for users</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </div>
            </label>
          </div>

          {/* Quest Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quest Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Beach Cleanup at Marina"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe what users need to do..."
            />
          </div>

          {/* Category and Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="cleanup">Cleanup</option>
                <option value="planting">Planting</option>
                <option value="recycling">Recycling</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact Points *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.impactPoints}
                onChange={(e) => setFormData({ ...formData, impactPoints: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Juhu Beach, Mumbai, Maharashtra"
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude *
              </label>
              <input
                type="text"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="19.0760"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude *
              </label>
              <input
                type="text"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="72.8777"
              />
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Get coordinates from{' '}
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                Google Maps
              </a>
              . Right-click a location and copy the coordinates.
            </p>
          </div>

          {/* AI Verification Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Verification Prompt *
            </label>
            <textarea
              required
              rows={3}
              value={formData.verificationPrompt}
              onChange={(e) => setFormData({ ...formData, verificationPrompt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe what should be visible in the photo for AI verification..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This helps the AI verify that users actually completed the quest
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Quest
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/quests')}
              disabled={saving}
              className="px-8 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
