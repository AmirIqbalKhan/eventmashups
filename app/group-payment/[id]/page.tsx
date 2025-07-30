'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface GroupPayment {
  id: string;
  event_id: string;
  ticket_tier_id: string;
  total_quantity: number;
  total_amount: number;
  status: string;
  event: {
    title: string;
    image: string;
    startDate: string;
    location: string;
  };
  ticketTier: {
    name: string;
    description: string;
  };
  contributions: Array<{
    id: string;
    contributor_email: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
}

export default function GroupPaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [groupPayment, setGroupPayment] = useState<GroupPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionLoading, setContributionLoading] = useState(false);

  const groupPaymentId = params.id as string;
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    fetchGroupPaymentDetails();
  }, [groupPaymentId]);

  const fetchGroupPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/group-payment/${groupPaymentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch group payment details');
      }
      const data = await response.json();
      setGroupPayment(data);
    } catch (error) {
      setError('Failed to load group payment details');
      console.error('Error fetching group payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    try {
      const response = await fetch(`/api/group-payment/${groupPaymentId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) return;

    setContributionLoading(true);
    try {
      const response = await fetch(`/api/group-payment/${groupPaymentId}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contribution');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create contribution');
    } finally {
      setContributionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !groupPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">{error || 'Group payment not found'}</div>
      </div>
    );
  }

  const totalContributed = groupPayment.contributions
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0);

  const remainingAmount = groupPayment.total_amount - totalContributed;
  const progressPercentage = (totalContributed / groupPayment.total_amount) * 100;
  const completedContributions = groupPayment.contributions.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Group Payment</h1>
          <p className="text-white/80 text-lg">
            {groupPayment.event.title}
          </p>
        </div>

        {/* Success/Cancel Messages */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 mb-8">
            <div className="text-green-400 font-semibold text-lg mb-2">Payment Successful!</div>
            <div className="text-white/80">Your contribution has been processed successfully.</div>
          </div>
        )}

        {canceled && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8">
            <div className="text-red-400 font-semibold text-lg mb-2">Payment Cancelled</div>
            <div className="text-white/80">Your payment was cancelled. You can try again.</div>
          </div>
        )}

        {/* Progress Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Payment Progress</h2>
            <div className="text-right">
              <div className="text-white/80 text-sm">Total Needed</div>
              <div className="text-white font-semibold">{formatCurrency(groupPayment.total_amount)}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/80 text-sm">Contributed</div>
              <div className="text-white font-semibold text-xl">{formatCurrency(totalContributed)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/80 text-sm">Remaining</div>
              <div className="text-white font-semibold text-xl">{formatCurrency(remainingAmount)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/80 text-sm">Contributors</div>
              <div className="text-white font-semibold text-xl">{completedContributions}/{groupPayment.total_quantity}</div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-white/80 text-sm mb-1">Event</div>
              <div className="text-white font-semibold">{groupPayment.event.title}</div>
            </div>
            <div>
              <div className="text-white/80 text-sm mb-1">Date</div>
              <div className="text-white font-semibold">{formatDate(groupPayment.event.startDate)}</div>
            </div>
            <div>
              <div className="text-white/80 text-sm mb-1">Location</div>
              <div className="text-white font-semibold">{groupPayment.event.location}</div>
            </div>
            <div>
              <div className="text-white/80 text-sm mb-1">Ticket Type</div>
              <div className="text-white font-semibold">{groupPayment.ticketTier.name}</div>
            </div>
          </div>
        </div>

        {/* Contribution Section */}
        {remainingAmount > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Make a Contribution</h2>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Contribution Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder={`Enter amount (max: ${formatCurrency(remainingAmount)})`}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={contributionLoading || !contributionAmount}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contributionLoading ? 'Processing...' : 'Contribute Now'}
              </button>
            </form>
          </div>
        )}

        {/* Invite Section */}
        {remainingAmount > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Invite Others</h2>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={inviteLoading || !inviteEmail}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteLoading ? 'Sending...' : 'Send Invitation'}
              </button>
            </form>
          </div>
        )}

        {/* Contributors List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Contributors</h2>
          <div className="space-y-3">
            {groupPayment.contributions.map((contribution) => (
              <div key={contribution.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <div>
                  <div className="text-white font-semibold">{contribution.contributor_email}</div>
                  <div className="text-white/60 text-sm">{formatDate(contribution.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{formatCurrency(contribution.amount)}</div>
                  <div className={`text-sm ${
                    contribution.status === 'completed' ? 'text-green-400' : 
                    contribution.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {contribution.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Event */}
        <div className="text-center mt-8">
          <Link 
            href={`/events/${groupPayment.event_id}`}
            className="inline-block bg-white/10 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-200"
          >
            Back to Event
          </Link>
        </div>
      </div>
    </div>
  );
} 