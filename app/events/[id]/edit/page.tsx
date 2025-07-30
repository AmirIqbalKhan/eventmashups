'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, redirect to create event page
    // In a full implementation, you would load the event data and pre-fill the form
    router.replace('/events/create');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Redirecting to event editor...</p>
        </div>
      </div>
    </div>
  );
} 