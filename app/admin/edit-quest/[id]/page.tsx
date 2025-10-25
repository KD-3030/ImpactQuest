'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Container,
  PageHeader,
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Select,
  LoadingSpinner,
} from '@/components/ui';

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
  blockchainQuestId?: number;
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
    impactPoints: '',
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
          impactPoints: q.impactPoints.toString(),
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/quests/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Quest deleted successfully!');
        router.push('/admin/quests');
      } else {
        alert('Failed to delete quest');
      }
    } catch (error) {
      console.error('Error deleting quest:', error);
      alert('An error occurred while deleting the quest');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const categoryOptions = [
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'planting', label: 'Planting' },
    { value: 'recycling', label: 'Recycling' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
  ];

  if (loading) {
    return (
      <Container>
        <Card>
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading quest..." />
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (!quest) {
    return (
      <Container>
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-gray-300 mb-4">Quest not found</p>
            <Button variant="primary" onClick={() => router.push('/admin/quests')}>
              Back to Quests
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="Edit Quest"
        description="Update quest details and settings"
        backButton={
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => router.push('/admin/quests')}
          >
            Back
          </Button>
        }
        action={
          <Button
            variant="danger"
            icon={Trash2}
            onClick={handleDelete}
          >
            Delete Quest
          </Button>
        }
      />

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Active Status Toggle */}
                <div className="bg-[#31087B]/20 p-4 rounded-lg border border-[#FA2FB5]/30">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium text-white">Quest Active Status</span>
                      <p className="text-sm text-gray-400">Enable or disable this quest for users</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#FA2FB5] peer-checked:to-[#FFC23C] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </div>
                  </label>
                </div>

                {/* Title */}
                <Input
                  label="Quest Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Beach Cleanup at Marina"
                />

                {/* Description */}
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe what users need to do..."
                />

                {/* Category & Impact Points */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Select
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    options={categoryOptions}
                  />

                  <Input
                    label="Impact Points"
                    name="impactPoints"
                    type="number"
                    value={formData.impactPoints}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="50"
                  />
                </div>

                {/* Location */}
                <div>
                  <Input
                    label="Location Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Juhu Beach, Mumbai, Maharashtra"
                    helperText="Enter the full address of the quest location"
                  />
                  
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <Input
                      label="Latitude"
                      name="latitude"
                      type="number"
                      value={formData.latitude}
                      onChange={handleChange}
                      required
                      step="any"
                      placeholder="19.0896"
                    />
                    <Input
                      label="Longitude"
                      name="longitude"
                      type="number"
                      value={formData.longitude}
                      onChange={handleChange}
                      required
                      step="any"
                      placeholder="72.8263"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    💡 Tip: Get coordinates from{' '}
                    <a 
                      href="https://www.google.com/maps" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#FA2FB5] hover:text-[#FFC23C] transition-colors"
                    >
                      Google Maps
                    </a>
                  </p>
                </div>

                {/* Verification Prompt */}
                <Textarea
                  label="AI Verification Prompt"
                  name="verificationPrompt"
                  value={formData.verificationPrompt}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe what should be visible in the photo..."
                  helperText="This helps the AI verify that users actually completed the quest"
                />

                {/* Blockchain Info */}
                {quest.blockchainQuestId && (
                  <div className="bg-[#FFC23C]/10 border border-[#FFC23C]/30 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-[#FFC23C]">Blockchain Quest ID:</span> #{quest.blockchainQuestId}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      This quest is linked to the smart contract
                    </p>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Save}
                    loading={saving}
                    fullWidth
                  >
                    {saving ? 'Updating...' : 'Update Quest'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/admin/quests')}
                    disabled={saving}
                    className="sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </Container>
  );
}
