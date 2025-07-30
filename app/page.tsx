'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { db } from '@/lib/database';
import { events } from '@/lib/database/schema';
import { desc } from 'drizzle-orm';

async function getFeaturedEvents() {
  try {
    const featuredEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt))
      .limit(6);
    return featuredEvents;
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return [];
  }
}

// Mock categories since they're not in the schema yet
const mockCategories = [
  { id: '1', name: 'Music', icon: '🎵', description: 'Concerts, festivals, and live performances' },
  { id: '2', name: 'Technology', icon: '💻', description: 'Conferences, workshops, and tech meetups' },
  { id: '3', name: 'Food & Drink', icon: '🍽️', description: 'Culinary events and wine tastings' },
  { id: '4', name: 'Sports', icon: '⚽', description: 'Games, tournaments, and fitness events' },
  { id: '5', name: 'Art & Culture', icon: '🎨', description: 'Exhibitions, galleries, and cultural events' },
  { id: '6', name: 'Business', icon: '💼', description: 'Networking, seminars, and corporate events' }
];

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  );
}

async function FeaturedEvents() {
  const eventsData = await getFeaturedEvents();
  
  if (eventsData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70 text-lg">No events available yet</p>
        <Link href="/events/create" className="btn-primary mt-4 inline-block">
          Create First Event
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {eventsData.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`} className="event-card group">
          <div className="relative h-40 sm:h-48 mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden">
            <img
              src={event.image || 'https://picsum.photos/400/300?random=1'}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://picsum.photos/400/300?random=1';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
              <span className="badge bg-purple-500/90 text-white font-semibold px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {event.category}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
              {event.title}
            </h3>
            <p className="text-white/90 line-clamp-2 text-sm sm:text-base">{event.description}</p>
            
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-white/80 font-medium">
                {new Date(event.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="font-semibold text-purple-300 bg-purple-500/20 px-2 sm:px-3 py-1 rounded-full text-xs">
                {event.location}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CategoryCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {mockCategories.map((category) => (
        <Link
          key={category.id}
          href={`/events?category=${category.name}`}
          className="card p-3 sm:p-4 md:p-6 text-center group hover:scale-105 transition-transform duration-300"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="text-lg sm:text-xl md:text-2xl">{category.icon}</span>
          </div>
          <h3 className="font-semibold text-white text-sm sm:text-base mb-1 sm:mb-2">
            {category.name}
          </h3>
          <p className="text-white/70 text-xs sm:text-sm line-clamp-2">
            {category.description}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Multiple Background Layers */}
        <div className="absolute inset-0 party-bg-1 opacity-20"></div>
        <div className="absolute inset-0 party-bg-2 opacity-15"></div>
        <div className="absolute inset-0 party-bg-3 opacity-10"></div>
        
        {/* Party Decorations */}
        <div className="party-decoration absolute top-20 left-10 hidden sm:block"></div>
        <div className="party-decoration absolute top-40 right-20 hidden sm:block"></div>
        <div className="party-decoration absolute bottom-20 left-20 hidden sm:block"></div>
        <div className="party-decoration absolute bottom-40 right-10 hidden sm:block"></div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight">
            Discover Amazing
            <span className="text-gradient block">Events</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-8 sm:mb-12 leading-relaxed px-4">
            Connect, celebrate, and create unforgettable memories with events that bring people together
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for events, locations, or categories..."
                className="input text-base sm:text-lg pr-16 sm:pr-20"
              />
              <button className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 btn-primary px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
                Search
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <Link href="/events" className="btn-primary text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 w-full sm:w-auto">
              Explore Events
            </Link>
            <Link href="/events/create" className="btn-outline text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 w-full sm:w-auto">
              Create Event
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 md:py-20 relative">
        <div className="party-decoration absolute top-10 left-5 hidden sm:block"></div>
        <div className="party-decoration absolute bottom-10 right-5 hidden sm:block"></div>
        
        <div className="container-custom">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Browse by Category
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4">
              Find events that match your interests and passions
            </p>
          </div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryCards />
          </Suspense>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-12 sm:py-16 md:py-20 relative">
        <div className="party-decoration absolute top-20 right-10 hidden sm:block"></div>
        <div className="party-decoration absolute bottom-20 left-10 hidden sm:block"></div>
        
        <div className="container-custom">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Featured Events
            </h2>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4">
              Discover the latest and most exciting events happening around you
            </p>
          </div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <FeaturedEvents />
          </Suspense>
          
          <div className="text-center mt-12">
            <Link href="/events" className="btn-outline text-lg px-8 py-4">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 relative">
        <div className="party-decoration absolute top-10 right-5"></div>
        <div className="party-decoration absolute bottom-10 left-5"></div>
        
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Event Mashups?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              We make event planning and discovery seamless, secure, and unforgettable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure & Reliable</h3>
              <p className="text-white/70">
                Your events and payments are protected with industry-leading security standards
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Lightning Fast</h3>
              <p className="text-white/70">
                Create, discover, and manage events with our optimized platform
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Community Driven</h3>
              <p className="text-white/70">
                Connect with like-minded people and build lasting relationships
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="party-decoration absolute top-20 left-10"></div>
        <div className="party-decoration absolute bottom-20 right-10"></div>
        
        <div className="container-custom">
          <div className="card p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers and attendees who trust Event Mashups for their next big moment
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup" className="btn-primary text-lg px-12 py-5">
                Get Started Free
              </Link>
              <Link href="/events" className="btn-outline text-lg px-12 py-5">
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 