'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleApplicationForm from '@/app/components/RoleApplicationForm';
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
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  isPublished: boolean;
}

interface Ticket {
  id: string;
  eventTitle: string;
  eventDate: string;
  status: string;
  qrCode: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
        setUser(userData);
        loadDashboardData(userData);
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

  const loadDashboardData = async (userData: User) => {
    try {
      // Load different data based on user role
      if (userData.isAdmin) {
        await loadAdminData();
      } else if (userData.isOrganizer) {
        await loadOrganizerData();
      } else {
        await loadUserData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadAdminData = async () => {
    const [eventsRes, statsRes] = await Promise.all([
      fetch('/api/events'),
      fetch('/api/admin/stats')
    ]);
    
    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      setEvents(eventsData.slice(0, 5));
    }
    
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      setStats(statsData);
    }
  };

  const loadOrganizerData = async () => {
    const [eventsRes, statsRes] = await Promise.all([
      fetch('/api/events?organizer=true'),
      fetch('/api/organizer/stats')
    ]);
    
    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      setEvents(eventsData.slice(0, 5));
    }
    
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      setStats(statsData);
    }
  };

  const loadUserData = async () => {
    const [ticketsRes, statsRes] = await Promise.all([
      fetch('/api/tickets/my-tickets'),
      fetch('/api/profile/stats')
    ]);
    
    if (ticketsRes.ok) {
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData.slice(0, 5));
    }
    
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      setStats(statsData);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-white/70">
            {user.isAdmin ? 'Admin Dashboard' : 
             user.isOrganizer ? 'Organizer Dashboard' : 
             'User Dashboard'}
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
            <div className="dashboard-label">
              {user.isAdmin || user.isOrganizer ? 'Tickets Sold' : 'My Tickets'}
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-stat">${stats.totalRevenue.toLocaleString()}</div>
            <div className="dashboard-label">
              {user.isAdmin || user.isOrganizer ? 'Total Revenue' : 'Spent'}
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-stat">{stats.upcomingEvents}</div>
            <div className="dashboard-label">Upcoming Events</div>
          </div>
        </div>

        {/* Unified Dashboard Content */}
        <UnifiedDashboard user={user} events={events} tickets={tickets} />
      </div>
    </div>
  );
}



function UnifiedDashboard({ user, events, tickets }: { user: User; events: Event[]; tickets: Ticket[] }) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="dashboard-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-white/70">
              Here's what's happening with your events and tickets
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/events/create" className="btn-primary text-sm px-4 py-2 text-center">
              Create Event
            </Link>
            <Link href="/events" className="btn-outline text-sm px-4 py-2 text-center">
              Browse Events
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-label">Total Events</p>
              <p className="dashboard-stat">{events.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-label">My Tickets</p>
              <p className="dashboard-stat">{tickets.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-label">Upcoming</p>
              <p className="dashboard-stat">
                {events.filter(e => new Date(e.startDate) > new Date()).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="dashboard-label">Role</p>
              <p className="dashboard-stat text-sm">
                {user.isAdmin ? 'Admin' : user.isOrganizer ? 'Organizer' : 'User'}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Events */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Events</h2>
            <Link href="/events" className="text-purple-400 hover:text-purple-300 text-sm">
              View All
            </Link>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70 mb-4">No events found</p>
              <Link href="/events/create" className="btn-primary text-sm">
                Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{event.title}</h3>
                    <p className="text-white/60 text-sm">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/events/${event.id}`} className="btn-outline text-xs px-3 py-1">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Tickets */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">My Tickets</h2>
            <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 text-sm">
              View All
            </Link>
          </div>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70 mb-4">No tickets yet</p>
              <Link href="/events" className="btn-primary text-sm">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{ticket.eventTitle}</h3>
                    <p className="text-white/60 text-sm">{ticket.eventDate}</p>
                  </div>
                  <span className={`badge ${ticket.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Role Applications */}
      {(user.isOrganizer || user.isAdmin) && (
        <div className="dashboard-card">
          <h2 className="text-xl font-bold text-white mb-6">Role Applications</h2>
          <RoleApplicationsList />
        </div>
      )}

      {/* Apply for Organizer Role */}
      {!user.isOrganizer && (
        <div className="dashboard-card">
          <h2 className="text-xl font-bold text-white mb-6">Become an Organizer</h2>
          <RoleApplicationForm />
        </div>
      )}
    </div>
  );
} 