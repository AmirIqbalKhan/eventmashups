'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RoleApplicationForm from '@/app/components/RoleApplicationForm';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOrganizer: boolean;
  isAdmin: boolean;
  bio?: string;
  avatar?: string;
}

interface Application {
  id: string;
  requestedRole: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'applications'>('profile');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        fetchApplications();
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

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/role-applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-96 bg-white/20 rounded-3xl"></div>
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-white/20 rounded-3xl"></div>
                <div className="h-64 bg-white/20 rounded-3xl"></div>
              </div>
            </div>
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
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="party-decoration absolute top-20 left-10"></div>
        <div className="party-decoration absolute top-40 right-20"></div>
        <div className="party-decoration absolute bottom-20 left-1/4"></div>
      </div>

      <div className="container-custom py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            Profile
          </h1>
          <p className="text-white/70 text-lg">
            Manage your account and role applications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="dashboard-card p-8">
            <div className="text-center mb-8">
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-white/70">{user.email}</p>
            </div>

            {/* Role Badges */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4">Current Roles</h3>
              <div className="flex flex-wrap gap-3">
                {user.isAdmin && (
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg">
                    👑 Admin
                  </span>
                )}
                {user.isOrganizer && (
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold shadow-lg">
                    🎪 Organizer
                  </span>
                )}
                {!user.isAdmin && !user.isOrganizer && (
                  <span className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full text-sm font-semibold shadow-lg">
                    👤 User
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4">Account Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-2xl">
                  <div className="text-2xl font-bold text-white">{applications.length}</div>
                  <div className="text-white/70 text-sm">Applications</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-2xl">
                  <div className="text-2xl font-bold text-white">
                    {applications.filter(app => app.status === 'pending').length}
                  </div>
                  <div className="text-white/70 text-sm">Pending</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link 
                href="/dashboard" 
                className="block w-full btn-primary text-center"
              >
                🏠 Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full btn-outline"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Navigation */}
            <div className="flex space-x-1 p-1 bg-white/10 rounded-2xl">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                📋 Profile Info
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
            {activeTab === 'profile' && (
              <div className="dashboard-card">
                <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/70 text-sm font-medium">Full Name</label>
                      <p className="text-white font-semibold text-lg">{user.firstName} {user.lastName}</p>
                    </div>
                    
                    <div>
                      <label className="text-white/70 text-sm font-medium">Email Address</label>
                      <p className="text-white font-semibold text-lg">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/70 text-sm font-medium">Account Type</label>
                      <div className="flex space-x-2 mt-2">
                        {user.isAdmin && (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold border border-purple-500/30">
                            Admin
                          </span>
                        )}
                        {user.isOrganizer && (
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                            Organizer
                          </span>
                        )}
                        {!user.isAdmin && !user.isOrganizer && (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold border border-gray-500/30">
                            User
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white/70 text-sm font-medium">Member Since</label>
                      <p className="text-white font-semibold">Active User</p>
                    </div>
                  </div>
                </div>

                {/* Role Information */}
                <div className="mt-8 p-6 bg-white/5 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Role Information</h3>
                  <div className="space-y-3 text-sm text-white/80">
                    <div className="flex items-start space-x-3">
                      <span className="text-purple-400">👑</span>
                      <div>
                        <span className="font-semibold text-white">Admin:</span> Full system access, manage users, review applications, and oversee platform operations.
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-400">🎪</span>
                      <div>
                        <span className="font-semibold text-white">Organizer:</span> Create and manage events, handle ticket sales, and manage event details.
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-gray-400">👤</span>
                      <div>
                        <span className="font-semibold text-white">User:</span> Browse events, purchase tickets, and participate in the community.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-6">
                {/* Apply for Role */}
                {!user.isAdmin && !user.isOrganizer && (
                  <RoleApplicationForm onSuccess={fetchApplications} userRole={user} />
                )}

                {/* Admin Message */}
                {user.isAdmin && (
                  <div className="dashboard-card p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-purple-400 text-2xl">👑</span>
                      <h3 className="text-xl font-semibold text-white">Admin Privileges</h3>
                    </div>
                    <p className="text-white/80">
                      As an admin, you have the highest level of privileges and can manage all aspects of the platform. 
                      You cannot apply for organizer roles as admins have superior permissions.
                    </p>
                  </div>
                )}

                {/* My Applications */}
                {applications.length > 0 ? (
                  <div className="dashboard-card">
                    <h2 className="text-2xl font-bold text-white mb-6">My Applications</h2>
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application.id} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-white font-semibold text-lg">
                                {application.requestedRole.charAt(0).toUpperCase() + application.requestedRole.slice(1)} Role Application
                              </h3>
                              <p className="text-white/70 text-sm">
                                Applied on {new Date(application.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                              application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              application.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {application.status === 'pending' && '⏳ Pending'}
                              {application.status === 'approved' && '✅ Approved'}
                              {application.status === 'rejected' && '❌ Rejected'}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="text-white font-medium mb-3">Application Reason:</h4>
                            <p className="text-white/80 text-sm leading-relaxed bg-white/5 p-4 rounded-xl">
                              {application.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="dashboard-card text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                    <p className="text-white/70">
                      {!user.isAdmin && !user.isOrganizer 
                        ? "Apply for a role to get started!"
                        : "You haven't submitted any role applications."
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 