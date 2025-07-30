'use client';

import { useState } from 'react';

export default function FixImagesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFixImages = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fix-images', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fix images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Fix Broken Images
          </h1>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <p className="text-white/80 mb-6">
              This tool will fix broken image URLs in existing events by replacing them with reliable placeholder images.
            </p>

            <button
              onClick={handleFixImages}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Fixing Images...' : 'Fix Broken Images'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-8">
              <div className="text-red-400 font-semibold text-lg mb-2">Error</div>
              <div className="text-white/80">{error}</div>
            </div>
          )}

          {result && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6">
              <div className="text-green-400 font-semibold text-lg mb-2">Success!</div>
              <div className="text-white/80 space-y-2">
                <div>{result.message}</div>
                <div>Fixed: {result.fixedCount} events</div>
                <div>Total: {result.totalEvents} events</div>
                
                {result.fixedEvents && result.fixedEvents.length > 0 && (
                  <div className="mt-4">
                    <div className="font-semibold mb-2">Fixed Events:</div>
                    <div className="space-y-2">
                      {result.fixedEvents.map((event: any) => (
                        <div key={event.id} className="bg-white/5 rounded-lg p-3">
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-sm text-white/60">
                            Old: {event.oldImage?.substring(0, 50)}...
                          </div>
                          <div className="text-sm text-green-400">
                            New: {event.newImage}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 