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

interface SalesData {
  totalRevenue: number;
  totalTickets: number;
  totalEvents: number;
  salesByEvent: Array<{
    eventId: string;
    eventTitle: string;
    ticketsSold: number;
    revenue: number;
    startDate: string;
    endDate: string;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    tickets: number;
  }>;
}

export default function OrganizerSalesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
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
        loadSalesData();
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

  const loadSalesData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/organizer/sales');
      if (response.ok) {
        const data = await response.json();
        setSalesData(data);
      } else {
        console.error('Failed to load sales data');
        setSalesData(null);
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      setSalesData(null);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
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
            <h1 className="text-4xl font-bold text-white">Sales Report 📊</h1>
            <div className="flex space-x-4">
              <button
                onClick={loadSalesData}
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
              <Link href="/organizer" className="btn-outline">
                ← Back to Organizer
              </Link>
            </div>
          </div>
          <p className="text-white/70">Track your event sales and revenue performance</p>
        </div>

        {salesData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="dashboard-card">
                <div className="dashboard-stat">{formatCurrency(salesData.totalRevenue)}</div>
                <div className="dashboard-label">Total Revenue</div>
              </div>
              
              <div className="dashboard-card">
                <div className="dashboard-stat">{salesData.totalTickets}</div>
                <div className="dashboard-label">Tickets Sold</div>
              </div>
              
              <div className="dashboard-card">
                <div className="dashboard-stat">{salesData.totalEvents}</div>
                <div className="dashboard-label">Events with Sales</div>
              </div>
            </div>

            {/* Sales by Event */}
            <div className="dashboard-card mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Sales by Event</h2>
              <div className="space-y-4">
                {salesData.salesByEvent.map((event) => (
                  <div key={event.eventId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{event.eventTitle}</h3>
                      <p className="text-white/70 text-sm">
                        {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-white font-semibold">{event.ticketsSold}</div>
                        <div className="text-white/70 text-sm">Tickets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">{formatCurrency(event.revenue)}</div>
                        <div className="text-white/70 text-sm">Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
                {salesData.salesByEvent.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-white/70">No sales data available yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Sales */}
            <div className="dashboard-card">
              <h2 className="text-2xl font-bold text-white mb-6">Monthly Sales</h2>
              <div className="space-y-4">
                {salesData.monthlySales.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div>
                      <h3 className="text-white font-semibold">{month.month}</h3>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-white font-semibold">{month.tickets}</div>
                        <div className="text-white/70 text-sm">Tickets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">{formatCurrency(month.revenue)}</div>
                        <div className="text-white/70 text-sm">Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
                {salesData.monthlySales.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-white/70">No monthly sales data available.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="dashboard-card text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Sales Data Loading</h3>
            <p className="text-white/70">Preparing your sales report...</p>
          </div>
        )}
      </div>
    </div>
  );
} 