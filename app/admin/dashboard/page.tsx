'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  Map, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalQuests: number;
  activeQuests: number;
  totalUsers: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  totalImpactPoints: number;
}

export default function AdminDashboard() {
  const { address } = useAccount();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuests: 0,
    activeQuests: 0,
    totalUsers: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    totalImpactPoints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch quests
      const questsRes = await fetch('/api/quests');
      const questsData = await questsRes.json();
      
      // Fetch submissions (we'll create this endpoint)
      const submissionsRes = await fetch('/api/admin/submissions');
      const submissionsData = await submissionsRes.json();
      
      // Fetch users stats (we'll create this endpoint)
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();

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
  };

  const statCards = [
    {
      title: 'Total Quests',
      value: stats.totalQuests,
      icon: Map,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Quests',
      value: stats.activeQuests,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingSubmissions,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Approved Submissions',
      value: stats.approvedSubmissions,
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Total Impact Points',
      value: stats.totalImpactPoints.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quest Master Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your impact platform.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/create-quest"
              className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center font-medium transition-colors"
            >
              + Create New Quest
            </a>
            <a
              href="/admin/submissions"
              className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors"
            >
              Review Pending Submissions
            </a>
            <a
              href="/admin/quests"
              className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-medium transition-colors"
            >
              Manage All Quests
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Platform Status</h2>
          <div className="space-y-4">
            {stats.pendingSubmissions > 0 ? (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">
                    {stats.pendingSubmissions} submission{stats.pendingSubmissions !== 1 ? 's' : ''} awaiting review
                  </p>
                  <p className="text-sm text-yellow-700">
                    Review submissions to help users earn their rewards
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">All caught up!</p>
                  <p className="text-sm text-green-700">
                    No pending submissions to review
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Map className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  {stats.activeQuests} active quest{stats.activeQuests !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-blue-700">
                  Keep your quests updated and engaging
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">
                  {stats.totalUsers} registered user{stats.totalUsers !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-purple-700">
                  Growing community of impact makers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
