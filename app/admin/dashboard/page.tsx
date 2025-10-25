'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Map, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  ClipboardList,
  Settings
} from 'lucide-react';
import { Container, PageHeader, Card, CardBody, CardTitle, CardDescription, Grid, Button } from '@/components/ui';

interface DashboardStats {
  totalQuests: number;
  activeQuests: number;
  totalUsers: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  totalImpactPoints: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuests: 0,
    activeQuests: 0,
    totalUsers: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    totalImpactPoints: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const [questsRes, submissionsRes, usersRes] = await Promise.all([
        fetch('/api/quests'),
        fetch('/api/admin/submissions'),
        fetch('/api/admin/users'),
      ]);

      const [questsData, submissionsData, usersData] = await Promise.all([
        questsRes.json(),
        submissionsRes.json(),
        usersRes.json(),
      ]);

      setStats({
        totalQuests: questsData.count || 0,
        activeQuests: questsData.quests?.filter((q: any) => q.isActive).length || 0,
        totalUsers: usersData.count || 0,
        pendingSubmissions: submissionsData.submissions?.filter((s: any) => !s.verified).length || 0,
        approvedSubmissions: submissionsData.submissions?.filter((s: any) => s.verified).length || 0,
        totalImpactPoints: usersData.totalPoints || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  const statCards = [
    {
      title: 'Total Quests',
      value: stats.totalQuests,
      icon: Map,
    },
    {
      title: 'Active Quests',
      value: stats.activeQuests,
      icon: CheckCircle,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingSubmissions,
      icon: Clock,
    },
    {
      title: 'Approved Submissions',
      value: stats.approvedSubmissions,
      icon: CheckCircle,
    },
    {
      title: 'Total Impact Points',
      value: stats.totalImpactPoints.toLocaleString(),
      icon: TrendingUp,
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Quest Master Dashboard"
        description="Welcome back! Here's an overview of your impact platform."
      />

      {/* Stats Grid */}
      {loading ? (
        <Grid cols={3} gap={6}>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <div className="h-4 bg-white/20 rounded w-1/2 mb-4 animate-pulse"></div>
                <div className="h-8 bg-white/20 rounded w-1/3 animate-pulse"></div>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : (
        <Grid cols={3} gap={6} className="mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} hover>
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#FA2FB5]/20 to-[#FFC23C]/20">
                      <Icon className="w-6 h-6 text-[#FFC23C]" />
                    </div>
                  </div>
                  <h3 className="text-gray-300 text-sm font-medium mb-1">
                    {card.title}
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {card.value}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </Grid>
      )}

      {/* Quick Actions & Platform Status */}
      <Grid cols={2} gap={6}>
        <Card>
          <CardBody>
            <CardTitle className="mb-4">Quick Actions</CardTitle>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/create-quest')}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#FA2FB5] to-[#31087B] hover:from-[#31087B] hover:to-[#FA2FB5] text-white rounded-lg font-medium transition-all text-left flex items-center justify-between shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Quest
                </span>
                <span className="text-sm opacity-80">→</span>
              </button>
              <button
                onClick={() => router.push('/admin/submissions')}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#31087B] to-[#100720] hover:from-[#100720] hover:to-[#31087B] text-white rounded-lg font-medium transition-all text-left flex items-center justify-between shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Review Submissions
                </span>
                <span className="text-sm opacity-80">→</span>
              </button>
              <button
                onClick={() => router.push('/admin/quests')}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#FFC23C] to-[#FA2FB5] hover:from-[#FA2FB5] hover:to-[#FFC23C] text-white rounded-lg font-medium transition-all text-left flex items-center justify-between shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Manage All Quests
                </span>
                <span className="text-sm opacity-80">→</span>
              </button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <CardTitle className="mb-4">Platform Status</CardTitle>
            <div className="space-y-4">
              {stats.pendingSubmissions > 0 ? (
                <div className="flex items-start gap-3 p-3 bg-[#FFC23C]/20 rounded-lg border border-[#FFC23C]/50">
                  <AlertCircle className="w-5 h-5 text-[#FFC23C] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">
                      {stats.pendingSubmissions} submission{stats.pendingSubmissions !== 1 ? 's' : ''} awaiting review
                    </p>
                    <p className="text-sm text-gray-300">
                      Review submissions to help users earn their rewards
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-[#FA2FB5]/20 rounded-lg border border-[#FA2FB5]/50">
                  <CheckCircle className="w-5 h-5 text-[#FA2FB5] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">All caught up!</p>
                    <p className="text-sm text-gray-300">
                      No pending submissions to review
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-[#31087B]/40 rounded-lg border border-[#FA2FB5]/30">
                <Map className="w-5 h-5 text-[#FFC23C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">
                    {stats.activeQuests} active quest{stats.activeQuests !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-300">
                    Keep your quests updated and engaging
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#31087B]/40 rounded-lg border border-[#FA2FB5]/30">
                <Users className="w-5 h-5 text-[#FFC23C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">
                    {stats.totalUsers} registered user{stats.totalUsers !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-300">
                    Growing community of impact makers
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Grid>
    </Container>
  );
}
