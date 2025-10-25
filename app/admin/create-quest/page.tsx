'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ArrowLeft, MapPin, Save, Gift, Info } from 'lucide-react';
import { Container, PageHeader, Card, CardBody, Button, Input, Textarea, Select } from '@/components/ui';

export default function CreateQuest() {
  const router = useRouter();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    category: 'cleanup',
    impactPoints: '',
    verificationPrompt: '',
  });

  // Calculate creator reward preview
  const calculateCreatorReward = () => {
    const points = parseInt(formData.impactPoints) || 0;
    const rewardTokens = Math.max(1, Math.min(10, Math.ceil(points * 0.05)));
    return rewardTokens;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
          address: formData.address,
          category: formData.category,
          impactPoints: parseInt(formData.impactPoints),
          verificationPrompt: formData.verificationPrompt,
          creatorAddress: address, // Include creator wallet address
        }),
      });

      if (response.ok) {
        alert('Quest created successfully!');
        router.push('/admin/quests');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating quest:', error);
      alert('Failed to create quest');
    } finally {
      setLoading(false);
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

  return (
    <Container>
      <PageHeader
        title="Create New Quest"
        description="Add a new environmental challenge for quest hunters"
        backButton={
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => router.back()}
          >
            Back
          </Button>
        }
      />

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <Input
                label="Quest Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Beach Cleanup at Juhu"
              />

              {/* Description */}
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe what participants need to do..."
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

              {/* Creator Reward Info */}
              {formData.impactPoints && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-[#FA2FB5]/10 to-[#FFC23C]/10 border border-[#FA2FB5]/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#FFC23C]/20 rounded-lg">
                      <Gift className="w-5 h-5 text-[#FFC23C]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                        Creator Reward Preview
                        <Info className="w-4 h-4 text-gray-400" />
                      </h4>
                      <p className="text-gray-300 text-sm mb-2">
                        You'll earn <span className="font-bold text-[#FFC23C]">{calculateCreatorReward()} tokens</span> each time someone completes this quest!
                      </p>
                      <p className="text-gray-400 text-xs">
                        Creator rewards are 5% of quest points (min 1, max 10 tokens)
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                    name="latitude"
                    type="number"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                    step="any"
                    placeholder="Latitude (e.g., 19.0896)"
                  />
                  <Input
                    name="longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                    step="any"
                    placeholder="Longitude (e.g., 72.8263)"
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
              <Input
                label="AI Verification Prompt"
                name="verificationPrompt"
                value={formData.verificationPrompt}
                onChange={handleChange}
                required
                placeholder="e.g., A person holding a trash bag on a beach"
                helperText="This describes what should be visible in the submitted photo for AI verification"
              />

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={Save}
                  loading={loading}
                  fullWidth
                >
                  {loading ? 'Creating...' : 'Create Quest'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
