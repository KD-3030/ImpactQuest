'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  Settings,
  User,
  Database,
  Bell,
  Shield,
  Mail,
  Globe,
  Save,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Container,
  PageHeader,
  Card,
  CardBody,
  Button,
  Input,
  Badge,
  LoadingSpinner,
} from '@/components/ui';

interface AdminProfile {
  walletAddress: string;
  role: string;
  totalImpactPoints: number;
  rewardTokens: number;
  createdAt: string;
}

interface SystemStats {
  totalUsers: number;
  totalQuests: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  totalShops: number;
}

export default function AdminSettings() {
  const { address } = useAccount();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Settings form state
  const [settings, setSettings] = useState({
    siteName: 'ImpactQuest',
    notificationsEnabled: true,
    autoApproveSubmissions: false,
    maintenanceMode: false,
    maxSubmissionsPerDay: 10,
    minImpactPoints: 10,
  });

  useEffect(() => {
    fetchProfileAndStats();
  }, [address]);

  const fetchProfileAndStats = async () => {
    setLoading(true);
    try {
      // Fetch admin profile
      if (address) {
        const profileResponse = await fetch(`/api/user/${address}`);
        const profileData = await profileResponse.json();
        if (profileData.user) {
          setProfile(profileData.user);
        }
      }

      // Fetch system stats
      const [usersRes, questsRes, submissionsRes, shopsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/quests'),
        fetch('/api/admin/submissions'),
        fetch('/api/shops'),
      ]);

      const [usersData, questsData, submissionsData, shopsData] = await Promise.all([
        usersRes.json(),
        questsRes.json(),
        submissionsRes.json(),
        shopsRes.json(),
      ]);

      setStats({
        totalUsers: usersData.total || usersData.users?.length || 0,
        totalQuests: questsData.total || questsData.quests?.length || 0,
        totalSubmissions: submissionsData.total || submissionsData.submissions?.length || 0,
        pendingSubmissions: submissionsData.submissions?.filter((s: any) => !s.verified).length || 0,
        totalShops: shopsData.count || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate save - in a real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleRefreshCache = async () => {
    setRefreshing(true);
    // Simulate cache refresh
    await fetchProfileAndStats();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatWallet = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <CardBody className="py-12 text-center">
            <LoadingSpinner size="lg" color="primary" label="Loading settings..." />
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Admin Settings"
          description="Manage your profile and system configuration"
        />
        <Button
          variant="outline"
          icon={RefreshCw}
          onClick={handleRefreshCache}
          loading={refreshing}
        >
          Refresh Data
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#FA2FB5] to-[#FFC23C] rounded-full">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Admin Profile</h3>
                    <Badge variant="warning" className="mt-1">Quest Master</Badge>
                  </div>
                </div>

                {profile && (
                  <div className="space-y-3">
                    <div className="bg-[#31087B]/30 rounded-lg p-3">
                      <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                      <p className="text-white font-mono text-sm break-all">
                        {formatWallet(profile.walletAddress)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#31087B]/30 rounded-lg p-3">
                        <p className="text-sm text-gray-400 mb-1">Impact Points</p>
                        <p className="text-2xl font-bold text-[#FFC23C]">
                          {profile.totalImpactPoints}
                        </p>
                      </div>
                      <div className="bg-[#31087B]/30 rounded-lg p-3">
                        <p className="text-sm text-gray-400 mb-1">Tokens</p>
                        <p className="text-2xl font-bold text-[#FA2FB5]">
                          {profile.rewardTokens}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#31087B]/30 rounded-lg p-3">
                      <p className="text-sm text-gray-400 mb-1">Member Since</p>
                      <p className="text-white">
                        {formatDate(profile.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* System Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#31087B] to-[#FA2FB5] rounded-full">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-white">System Overview</h3>
                </div>

                {stats && (
                  <div className="space-y-3">
                    {[
                      { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400' },
                      { label: 'Total Quests', value: stats.totalQuests, color: 'text-green-400' },
                      { label: 'Submissions', value: stats.totalSubmissions, color: 'text-purple-400' },
                      { label: 'Pending Review', value: stats.pendingSubmissions, color: 'text-yellow-400' },
                      { label: 'Local Shops', value: stats.totalShops, color: 'text-pink-400' },
                    ].map((stat, index) => (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between bg-[#31087B]/30 rounded-lg p-3"
                      >
                        <span className="text-gray-400">{stat.label}</span>
                        <span className={`text-xl font-bold ${stat.color}`}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-6 h-6 text-[#FA2FB5]" />
                  <h3 className="font-bold text-lg text-white">General Settings</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Site Name
                    </label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      placeholder="Enter site name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Submissions Per Day
                    </label>
                    <Input
                      type="number"
                      value={settings.maxSubmissionsPerDay}
                      onChange={(e) => setSettings({ ...settings, maxSubmissionsPerDay: parseInt(e.target.value) })}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Impact Points
                    </label>
                    <Input
                      type="number"
                      value={settings.minImpactPoints}
                      onChange={(e) => setSettings({ ...settings, minImpactPoints: parseInt(e.target.value) })}
                      placeholder="10"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-[#FA2FB5]" />
                  <h3 className="font-bold text-lg text-white">Notifications</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#31087B]/30 rounded-lg p-4">
                    <div>
                      <p className="text-white font-medium">Enable Notifications</p>
                      <p className="text-sm text-gray-400">Receive alerts for new submissions</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notificationsEnabled ? 'bg-[#FA2FB5]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-[#31087B]/30 rounded-lg p-4">
                    <div>
                      <p className="text-white font-medium">Auto-Approve Submissions</p>
                      <p className="text-sm text-gray-400">Automatically verify AI-approved quests</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, autoApproveSubmissions: !settings.autoApproveSubmissions })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoApproveSubmissions ? 'bg-[#FA2FB5]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoApproveSubmissions ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* System Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardBody>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-[#FA2FB5]" />
                  <h3 className="font-bold text-lg text-white">System Control</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#31087B]/30 rounded-lg p-4 border-2 border-yellow-500/30">
                    <div>
                      <p className="text-white font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-400">Temporarily disable public access</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.maintenanceMode ? 'bg-yellow-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.maintenanceMode && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-400 text-sm">
                        ⚠️ Maintenance mode is enabled. Users won't be able to access the platform.
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to defaults
                setSettings({
                  siteName: 'ImpactQuest',
                  notificationsEnabled: true,
                  autoApproveSubmissions: false,
                  maintenanceMode: false,
                  maxSubmissionsPerDay: 10,
                  minImpactPoints: 10,
                });
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSaveSettings}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
