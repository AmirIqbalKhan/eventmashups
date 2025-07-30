'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleApplicationsList from '@/app/components/RoleApplicationsList';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOrganizer: boolean;
  isAdmin: boolean;
}

interface Event {
  id: string;
  title: string;
  organizerName: string;
  startDate: string;
  status: string;
  ticketSales: number;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOrganizer: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events' | 'applications'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    pendingApprovals: 0
  });

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
        loadAdminData();
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

  const loadAdminData = async () => {
    try {
      const [statsRes, eventsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/events'),
        fetch('/api/admin/users')
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleToggleUserRole = async (userId: string, role: 'organizer' | 'admin') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      
      if (response.ok) {
        loadAdminData(); // Reload data
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleToggleEventStatus = async (eventId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        loadAdminData(); // Reload data
      }
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded-lg mb-8"></div>
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
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Dashboard 🔧
          </h1>
          <p className="text-white/70">
            Manage the platform, users, and events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="dashboard-card">
            <div className="dashboard-stat">{stats.totalUsers}</div>
            <div className="dashboard-label">Total Users</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-stat">{stats.totalEvents}</div>
            <div className="dashboard-label">Total Events</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-stat">${stats.totalRevenue.toLocaleString()}</div>
            <div className="dashboard-label">Total Revenue</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-stat">{stats.pendingApprovals}</div>
            <div className="dashboard-label">Pending Approvals</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/analytics" className="btn-primary text-center">
              📊 Analytics
            </Link>
            <button onClick={() => setActiveTab('users')} className="btn-secondary text-center">
              👥 Manage Users
            </button>
            <button onClick={() => setActiveTab('events')} className="btn-outline text-center">
              🎪 Manage Events
            </button>
            <button onClick={() => setActiveTab('applications')} className="btn-outline text-center">
              📝 Role Applications
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 p-1 bg-white/10 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-purple-900 shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-white text-purple-900 shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'events'
                ? 'bg-white text-purple-900 shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            🎪 Events
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'applications'
                ? 'bg-white text-purple-900 shadow-lg'
                : 'text-white/70 hover:text-white'
            }`}
          >
            📝 Applications
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="dashboard-card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Events</h2>
              <button onClick={() => setActiveTab('events')} className="text-purple-400 hover:text-purple-300">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div>
                    <h3 className="text-white font-semibold">{event.title}</h3>
                    <p className="text-white/70 text-sm">by {event.organizerName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'published' ? 'bg-green-500/20 text-green-400' : 
                      event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {event.status}
                    </span>
                    <span className="text-white/60 text-sm">
                      {event.ticketSales} tickets
                    </span>
                    {event.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleEventStatus(event.id, 'approve')}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs hover:bg-green-500/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleToggleEventStatus(event.id, 'reject')}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs hover:bg-red-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="dashboard-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Users</h2>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div>
                    <h3 className="text-white font-semibold">{user.firstName} {user.lastName}</h3>
                    <p className="text-white/70 text-sm">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      {user.isAdmin && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                          Admin
                        </span>
                      )}
                      {user.isOrganizer && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                          Organizer
                        </span>
                      )}
                      {!user.isAdmin && !user.isOrganizer && (
                        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
                          User
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!user.isOrganizer && !user.isAdmin && (
                        <>
                          <button
                            onClick={() => handleToggleUserRole(user.id, 'organizer')}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs hover:bg-blue-500/30"
                          >
                            Make Organizer
                          </button>
                          <button
                            onClick={() => handleToggleUserRole(user.id, 'admin')}
                            className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs hover:bg-purple-500/30"
                          >
                            Make Admin
                          </button>
                        </>
                      )}
                      {(user.isOrganizer || user.isAdmin) && (
                        <button
                          onClick={() => handleToggleUserRole(user.id, user.isAdmin ? 'admin' : 'organizer')}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs hover:bg-red-500/30"
                        >
                          Remove Role
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="dashboard-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Events</h2>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div>
                    <h3 className="text-white font-semibold">{event.title}</h3>
                    <p className="text-white/70 text-sm">by {event.organizerName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'published' ? 'bg-green-500/20 text-green-400' : 
                      event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {event.status}
                    </span>
                    <span className="text-white/60 text-sm">
                      {event.ticketSales} tickets
                    </span>
                    {event.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleEventStatus(event.id, 'approve')}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs hover:bg-green-500/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleToggleEventStatus(event.id, 'reject')}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs hover:bg-red-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="dashboard-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Role Applications</h2>
            <RoleApplicationsList />
          </div>
        )}

        {/* Recent Users */}
        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Users</h2>
            <Link href="/admin/users" className="text-purple-400 hover:text-purple-300">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {users.map((userData) => (
              <div key={userData.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div>
                  <h3 className="text-white font-semibold">
                    {userData.firstName} {userData.lastName}
                  </h3>
                  <p className="text-white/70 text-sm">{userData.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    userData.isAdmin ? 'bg-purple-500/20 text-purple-400' :
                    userData.isOrganizer ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {userData.isAdmin ? 'Admin' : userData.isOrganizer ? 'Organizer' : 'User'}
                  </span>
                  <div className="flex space-x-2">
                    {!userData.isOrganizer && (
                      <button
                        onClick={() => handleToggleUserRole(userData.id, 'organizer')}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs hover:bg-blue-500/30"
                      >
                        Make Organizer
                      </button>
                    )}
                    {!userData.isAdmin && (
                      <button
                        onClick={() => handleToggleUserRole(userData.id, 'admin')}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs hover:bg-purple-500/30"
                      >
                        Make Admin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 