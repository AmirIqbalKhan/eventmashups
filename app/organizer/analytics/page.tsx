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
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  upcomingEvents: number;
  monthlyGrowth: {
    events: number;
    tickets: number;
    revenue: number;
  };
  topEvents: Array<{
    title: string;
    tickets: number;
    revenue: number;
  }>;
}

export default function OrganizerAnalyticsPage() {
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
        if (!userData.isOrganizer && !userData.isAdmin) {
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
      const response = await fetch('/api/organizer/stats');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to load analytics data');
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setAnalyticsData(null);
    } finally {
      setRefreshing(false);
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

  if (!user?.isOrganizer && !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-white">Organizer Analytics 📊</h1>
            <Link href="/organizer" className="btn-outline">
              ← Back to Organizer
            </Link>
          </div>
          <p className="text-white/70">Track your event performance and revenue</p>
        </div>

        {analyticsData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <div className="dashboard-stat">${analyticsData.totalRevenue.toLocaleString()}</div>
                  <div className="text-green-400 text-sm">+{analyticsData.monthlyGrowth.revenue}%</div>
                </div>
                <div className="dashboard-label">Total Revenue</div>
              </div>
              
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="dashboard-stat">{analyticsData.upcomingEvents}</div>
                  <div className="text-blue-400 text-sm">Scheduled</div>
                </div>
                <div className="dashboard-label">Upcoming Events</div>
              </div>
            </div>

            {/* Top Events */}
            <div className="dashboard-card">
              <h2 className="text-2xl font-bold text-white mb-6">Top Performing Events</h2>
              <div className="space-y-4">
                {analyticsData.topEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{event.title}</h3>
                        <p className="text-white/70 text-sm">{event.tickets} tickets sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">${event.revenue.toLocaleString()}</div>
                      <div className="text-white/70 text-sm">Revenue</div>
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