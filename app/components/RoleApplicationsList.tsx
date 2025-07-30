'use client';

import { useState, useEffect } from 'react';

interface Application {
  id: string;
  userId: string;
  requestedRole: string;
  reason: string;
  status: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function RoleApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/role-applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (error) {
      setError('An error occurred while fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (applicationId: string, action: 'approve' | 'reject') => {
    setReviewing(applicationId);
    try {
      const response = await fetch(`/api/role-applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Refresh the applications list
        fetchApplications();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to review application');
      }
    } catch (error) {
      setError('An error occurred while reviewing the application');
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card p-8">
        <div className="animate-pulse">
          <div className="h-12 bg-white/20 rounded-2xl mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-white/20 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card p-8">
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const reviewedApplications = applications.filter(app => app.status !== 'pending');

  return (
    <div className="dashboard-card p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-2xl">
          📋
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Role Applications</h2>
        <p className="text-white/70">Review and manage role applications from users</p>
      </div>
      
      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Applications</h3>
          <p className="text-white/70">There are no role applications to review at the moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Applications */}
          {pendingApplications.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-yellow-400 text-xl">⏳</span>
                <h3 className="text-xl font-semibold text-white">Pending Review ({pendingApplications.length})</h3>
              </div>
              <div className="space-y-6">
                {pendingApplications.map((application) => (
                  <div key={application.id} className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-3xl hover:border-yellow-500/30 transition-all duration-200">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {application.user.firstName.charAt(0)}{application.user.lastName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {application.user.firstName} {application.user.lastName}
                          </h3>
                          <p className="text-white/70">{application.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`}>
                          ⏳ Pending
                        </span>
                        <p className="text-white/50 text-xs mt-2">
                          {new Date(application.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`text-lg ${
                          application.requestedRole === 'admin' ? 'text-purple-400' : 'text-blue-400'
                        }`}>
                          {application.requestedRole === 'admin' ? '👑' : '🎪'}
                        </span>
                        <span className="text-white font-semibold">
                          Requesting: {application.requestedRole.charAt(0).toUpperCase() + application.requestedRole.slice(1)} Role
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-3">Application Reason:</h4>
                        <p className="text-white/80 text-sm leading-relaxed bg-white/5 p-4 rounded-xl">
                          {application.reason}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleReview(application.id, 'reject')}
                        disabled={reviewing === application.id}
                        className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reviewing === application.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                            <span>Rejecting...</span>
                          </div>
                        ) : (
                          '❌ Reject'
                        )}
                      </button>
                      <button
                        onClick={() => handleReview(application.id, 'approve')}
                        disabled={reviewing === application.id}
                        className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reviewing === application.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                            <span>Approving...</span>
                          </div>
                        ) : (
                          '✅ Approve'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed Applications */}
          {reviewedApplications.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-gray-400 text-xl">📋</span>
                <h3 className="text-xl font-semibold text-white">Reviewed Applications ({reviewedApplications.length})</h3>
              </div>
              <div className="space-y-4">
                {reviewedApplications.map((application) => (
                  <div key={application.id} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {application.user.firstName.charAt(0)}{application.user.lastName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {application.user.firstName} {application.user.lastName}
                          </h3>
                          <p className="text-white/70 text-sm">{application.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          application.status === 'approved' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {application.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                        <p className="text-white/50 text-xs mt-1">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 