'use client';

import { useEffect, useState } from 'react';

interface Match {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    interests: string[];
  };
  matchScore: number;
  sharedInterests: string[];
}

export default function Matchmaking({ eventId }: { eventId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/matchmaking?eventId=${eventId}`);
        const data = await res.json();
        if (res.ok) {
          setMatches(data.matches || []);
        } else {
          setError(data.error || 'Failed to load matches.');
        }
      } catch (err) {
        setError('Failed to load matches.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [eventId]);

  if (loading) {
    return <div className="py-8 text-center"><div className="spinner mx-auto" /></div>;
  }
  if (error) {
    return <div className="py-8 text-center text-red-600">{error}</div>;
  }
  if (matches.length === 0) {
    return <div className="py-8 text-center text-gray-500">No matches found for this event yet.</div>;
  }

  return (
    <div className="py-8">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Find Your Match</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <div key={match.user.id} className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <img
              src={match.user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(match.user.firstName + ' ' + match.user.lastName)}
              alt={match.user.firstName}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{match.user.firstName} {match.user.lastName}</h4>
              <p className="text-sm text-gray-600 mb-1">{match.user.bio}</p>
              <div className="flex flex-wrap gap-1 mb-1">
                {match.sharedInterests.map((interest) => (
                  <span key={interest} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                    {interest}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">{match.matchScore} shared interest{match.matchScore !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 