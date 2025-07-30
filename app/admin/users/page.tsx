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
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

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
        loadUsers();
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

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        console.error('Failed to load users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleToggleUserRole = async (userId: string, role: 'organizer' | 'admin') => {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role,
          action: 'grant'
        }),
      });

      if (response.ok) {
        loadUsers(); // Reload users
      } else {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveRole = async (userId: string, currentRole: 'organizer' | 'admin') => {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: currentRole,
          action: 'revoke'
        }),
      });

      if (response.ok) {
        loadUsers(); // Reload users
      } else {
        console.error('Failed to remove user role');
      }
    } catch (error) {
      console.error('Error removing user role:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white/20 rounded-2xl"></div>
              ))}
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
            <h1 className="text-4xl font-bold text-white">User Management ��</h1>
            <div className="flex space-x-4">
              <button
                onClick={loadUsers}
                disabled={updating !== null}
                className="btn-outline"
              >
                {updating !== null ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Refresh Users'
                )}
              </button>
              <Link href="/admin" className="btn-outline">
                ← Back to Admin
              </Link>
            </div>
          </div>
          <p className="text-white/70">Manage user roles and permissions</p>
        </div>

        {/* Users List */}
        <div className="dashboard-card">
          <h2 className="text-2xl font-bold text-white mb-6">All Users</h2>
          <div className="space-y-4">
            {users.map((userItem) => (
              <div key={userItem.id} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {userItem.firstName.charAt(0)}{userItem.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {userItem.firstName} {userItem.lastName}
                    </h3>
                    <p className="text-white/70">{userItem.email}</p>
                    <p className="text-white/50 text-sm">
                      Joined {new Date(userItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    {userItem.isAdmin && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                        Admin
                      </span>
                    )}
                    {userItem.isOrganizer && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                        Organizer
                      </span>
                    )}
                    {!userItem.isAdmin && !userItem.isOrganizer && (
                      <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
                        User
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {!userItem.isOrganizer && !userItem.isAdmin && (
                      <>
                        <button
                          onClick={() => handleToggleUserRole(userItem.id, 'organizer')}
                          disabled={updating === userItem.id}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs hover:bg-blue-500/30 disabled:opacity-50"
                        >
                          {updating === userItem.id ? 'Updating...' : 'Make Organizer'}
                        </button>
                        <button
                          onClick={() => handleToggleUserRole(userItem.id, 'admin')}
                          disabled={updating === userItem.id}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs hover:bg-purple-500/30 disabled:opacity-50"
                        >
                          {updating === userItem.id ? 'Updating...' : 'Make Admin'}
                        </button>
                      </>
                    )}
                    {(userItem.isOrganizer || userItem.isAdmin) && (
                      <button
                        onClick={() => handleRemoveRole(userItem.id, userItem.isAdmin ? 'admin' : 'organizer')}
                        disabled={updating === userItem.id}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs hover:bg-red-500/30 disabled:opacity-50"
                      >
                        {updating === userItem.id ? 'Updating...' : 'Remove Role'}
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