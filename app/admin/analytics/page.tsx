'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOrganizer: boolean;
  isAdmin: boolean;
}

interface AnalyticsData {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  totalTickets: number;
  monthlyGrowth: {
    users: number;
    events: number;
    revenue: number;
    tickets: number;
  };
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
  userStats: {
    regularUsers: number;
    organizers: number;
    admins: number;
  };
  eventStats: {
    published: number;
    drafts: number;
    upcoming: number;
    past: number;
  };
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        if (!userData.isAdmin) {
          router.push('/dashboard');
          return;
        }
        setUser(userData);
        loadAnalyticsData();
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/20 rounded-3xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-white/20 rounded-3xl"></div>
              <div className="h-96 bg-white/20 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-white">Admin Analytics 📊</h1>
            <div className="flex space-x-4">
              <button
                onClick={loadAnalyticsData}
                disabled={refreshing}
                className="btn-outline"
              >
                {refreshing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Refreshing...</span>
                  </div>
                ) : (
                  'Refresh Data'
                )}
              </button>
              <Link href="/admin" className="btn-outline">
                ← Back to Admin
              </Link>
            </div>
          </div>
          <p className="text-white/70">Comprehensive platform analytics and insights</p>
        </div>

        {analyticsData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="dashboard-stat">{analyticsData.totalUsers}</div>
                  <div className="text-green-400 text-sm">+{analyticsData.monthlyGrowth.users}%</div>
                </div>
                <div className="dashboard-label">Total Users</div>
              </div>
              
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="dashboard-stat">{analyticsData.totalEvents}</div>
                  <div className="text-green-400 text-sm">+{analyticsData.monthlyGrowth.events}%</div>
                </div>
                <div className="dashboard-label">Total Events</div>
              </div>
              
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="dashboard-stat">{analyticsData.totalTickets}</div>
                  <div className="text-green-400 text-sm">+{analyticsData.monthlyGrowth.tickets}%</div>
                </div>
                <div className="dashboard-label">Tickets Sold</div>
              </div>
              
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="dashboard-stat">{formatCurrency(analyticsData.totalRevenue)}</div>
                  <div className="text-green-400 text-sm">+{analyticsData.monthlyGrowth.revenue}%</div>
                </div>
                <div className="dashboard-label">Total Revenue</div>
              </div>
            </div>

            {/* User & Event Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="dashboard-card">
                <h2 className="text-2xl font-bold text-white mb-6">User Distribution</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-sm font-bold">U</span>
                      </div>
                      <span className="text-white">Regular Users</span>
                    </div>
                    <span className="text-white font-semibold">{analyticsData.userStats.regularUsers}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 text-sm font-bold">O</span>
                      </div>
                      <span className="text-white">Organizers</span>
                    </div>
                    <span className="text-white font-semibold">{analyticsData.userStats.organizers}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-red-400 text-sm font-bold">A</span>
                      </div>
                      <span className="text-white">Admins</span>
                    </div>
                    <span className="text-white font-semibold">{analyticsData.userStats.admins}</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <h2 className="text-2xl font-bold text-white mb-6">Event Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-white">Published</span>
                    </div>
                    <span className="text-white font-semibold">{analyticsData.eventStats.published}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <span className="text-yellow-400 text-sm">📝</span>
                      </div>
                      <span className="text-white">Drafts</span>
                    </div>
                    <span className="text-white font-semibold">{analyticsData.eventStats.drafts}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-sm">📅</span>
                      </div>
                      <span className="text-white">Upcoming</span>
                    </div>
                    <span className="text-white font-semibold">{analyticsData.eventStats.upcoming}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div className="dashboard-card mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Top Event Categories</h2>
              <div className="space-y-4">
                {analyticsData.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold capitalize">{category.category}</h3>
                        <p className="text-white/70 text-sm">{category.count} events</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{formatCurrency(category.revenue)}</div>
                      <div className="text-white/70 text-sm">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-card">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm">
                      {activity.type === 'event' ? '🎪' : activity.type === 'user' ? '👤' : '💰'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.description}</p>
                      {activity.user && (
                        <p className="text-white/70 text-sm">by {activity.user}</p>
                      )}
                      <p className="text-white/50 text-xs">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="dashboard-card text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Analytics Loading</h3>
            <p className="text-white/70">Preparing your analytics dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
} 