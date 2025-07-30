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
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

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
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
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
            <div className="h-96 bg-white/20 rounded-3xl"></div>
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
            <h1 className="text-4xl font-bold text-white">Analytics Dashboard 📊</h1>
            <Link href="/admin" className="btn-outline">
              ← Back to Admin
            </Link>
          </div>
          <p className="text-white/70">Real-time insights and platform performance metrics</p>
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
                  <div className="dashboard-stat">${analyticsData.totalRevenue.toLocaleString()}</div>
                  <div className="text-green-400 text-sm">+{analyticsData.monthlyGrowth.revenue}%</div>
                </div>
                <div className="dashboard-label">Total Revenue</div>
              </div>
              
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="dashboard-stat">{analyticsData.totalTickets}</div>
                  <div className="text-blue-400 text-sm">Sold</div>
                </div>
                <div className="dashboard-label">Total Tickets</div>
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
                        <h3 className="text-white font-semibold">{category.category}</h3>
                        <p className="text-white/70 text-sm">{category.count} events</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${category.revenue.toLocaleString()}</div>
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
                  <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.description}</p>
                      <p className="text-white/60 text-sm">{activity.timestamp}</p>
                    </div>
                    <span className="text-white/40 text-sm">{activity.type}</span>
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