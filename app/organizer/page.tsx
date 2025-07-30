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

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  isPublished: boolean;
  ticketSales: number;
  revenue: number;
}

export default function OrganizerPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  });

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
        loadOrganizerData();
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

  const loadOrganizerData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch('/api/organizer/stats'),
        fetch('/api/organizer/events')
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error loading organizer data:', error);
    }
  };

  const handleToggleEventStatus = async (eventId: string, action: 'publish' | 'unpublish') => {
    try {
      const response = await fetch(`/api/organizer/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        loadOrganizerData(); // Reload data
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

  if (!user?.isOrganizer && !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Organizer Dashboard 🎪
          </h1>
          <p className="text-white/70">
            Manage your events and track your success
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="dashboard-card">
            <div className="dashboard-stat">{stats.totalEvents}</div>
            <div className="dashboard-label">Total Events</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-stat">{stats.totalTickets}</div>
            <div className="dashboard-label">Tickets Sold</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-stat">${stats.totalRevenue.toLocaleString()}</div>
            <div className="dashboard-label">Total Revenue</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-stat">{stats.upcomingEvents}</div>
            <div className="dashboard-label">Upcoming Events</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/events/create" className="btn-primary text-center">
              Create Event
            </Link>
            <Link href="/organizer/analytics" className="btn-secondary text-center">
              Analytics
            </Link>
            <Link href="/organizer/sales" className="btn-outline text-center">
              Sales Report
            </Link>
            <Link href="/organizer/settings" className="btn-outline text-center">
              Organizer Settings
            </Link>
          </div>
        </div>

        {/* My Events */}
        <div className="dashboard-card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Events</h2>
            <Link href="/events/create" className="text-purple-400 hover:text-purple-300">
              Create New Event
            </Link>
          </div>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{event.title}</h3>
                  <p className="text-white/70 text-sm">{event.location}</p>
                  <p className="text-white/60 text-xs">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white/60 text-sm">{event.ticketSales} tickets sold</p>
                    <p className="text-green-400 font-semibold">${event.revenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {event.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        href={`/events/${event.id}/edit`}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs hover:bg-blue-500/30"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleEventStatus(event.id, event.isPublished ? 'unpublish' : 'publish')}
                        className={`px-3 py-1 rounded-full text-xs ${
                          event.isPublished 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {event.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/70 mb-4">You haven't created any events yet.</p>
                <Link href="/events/create" className="btn-primary">
                  Create Your First Event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">New ticket sold</p>
                  <p className="text-white/70 text-sm">Tech Conference 2024</p>
                </div>
              </div>
              <span className="text-white/60 text-sm">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">Event updated</p>
                  <p className="text-white/70 text-sm">Jazz Night - Venue changed</p>
                </div>
              </div>
              <span className="text-white/60 text-sm">1 day ago</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">Revenue milestone</p>
                  <p className="text-white/70 text-sm">Reached $1,000 in sales</p>
                </div>
              </div>
              <span className="text-white/60 text-sm">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 