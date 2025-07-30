'use client';

import { useState } from 'react';

interface RoleApplicationFormProps {
  onSuccess?: () => void;
  userRole?: {
    isAdmin: boolean;
    isOrganizer: boolean;
  };
}

export default function RoleApplicationForm({ onSuccess, userRole }: RoleApplicationFormProps) {
  const [requestedRole, setRequestedRole] = useState<'admin' | 'organizer'>('organizer');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/role-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestedRole,
          reason
        }),
      });

      if (response.ok) {
        setSuccess('Role application submitted successfully!');
        setReason('');
        onSuccess?.();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application');
      }
    } catch (error) {
      setError('An error occurred while submitting the application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl">
          📝
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Apply for Role</h2>
        <p className="text-white/70">Request elevated permissions to contribute more to our community</p>
        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> Users can only have one role at a time. If approved, you will lose any existing roles.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
          <div className="flex items-center space-x-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl">
          <div className="flex items-center space-x-3">
            <span className="text-green-400 text-xl">✅</span>
            <p className="text-green-400">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-4 text-lg">Requested Role</label>
          <div className={`grid gap-4 ${
            userRole?.isAdmin ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {!userRole?.isAdmin && (
              <button
                type="button"
                onClick={() => setRequestedRole('organizer')}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                  requestedRole === 'organizer'
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">🎪</span>
                  <span className="font-semibold">Organizer</span>
                </div>
                <p className="text-sm opacity-80">Create and manage events</p>
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setRequestedRole('admin')}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left ${
                requestedRole === 'admin'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                  : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">👑</span>
                <span className="font-semibold">Admin</span>
              </div>
              <p className="text-sm opacity-80">Full system access and user management</p>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-white font-semibold mb-3 text-lg">
            Why do you want this role?
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-6 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
            rows={5}
            placeholder="Please explain your motivation, relevant experience, and how you plan to contribute to our community..."
            required
          />
          <p className="text-white/50 text-sm mt-2">Be specific about your experience and goals</p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>

             <div className="mt-8 p-6 bg-white/5 rounded-2xl">
         <h3 className="text-lg font-semibold text-white mb-4">Role Information</h3>
         <div className="space-y-4 text-sm text-white/80">
           {!userRole?.isAdmin && (
             <div className="flex items-start space-x-3">
               <span className="text-blue-400 text-lg">🎪</span>
               <div>
                 <span className="font-semibold text-white">Organizer:</span> Create and manage events, handle ticket sales, and manage event details. Perfect for event planners and community leaders.
               </div>
             </div>
           )}
           <div className="flex items-start space-x-3">
             <span className="text-purple-400 text-lg">👑</span>
             <div>
               <span className="font-semibold text-white">Admin:</span> Full system access, manage users, review applications, and oversee platform operations. Requires significant experience and trust.
               {userRole?.isAdmin && (
                 <span className="block text-purple-300 mt-1">Note: Admins have higher privileges and cannot apply for organizer roles.</span>
               )}
             </div>
           </div>
         </div>
       </div>
    </div>
  );
} 