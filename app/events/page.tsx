'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description: string;
  image: string | null;
  category: string;
  location: string;
  startDate: Date;
  endDate: Date;
  isPublished: boolean | null;
  isFeatured: boolean | null;
  createdAt: Date | null;
}

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchParams = useSearchParams();

  // Mock categories since they're not in the schema yet
  const categories = [
    'Music', 'Technology', 'Food & Drink', 'Sports', 'Art & Culture', 'Business', 'Education', 'Health & Wellness'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Get category from URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterAndSortEvents();
  }, [allEvents, searchTerm, selectedCategory, sortBy]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setAllEvents(data.events || data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = [...allEvents];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('date');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container-custom">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Discover Events</h1>
              <p className="text-white/90 text-lg">Find amazing events happening around you</p>
            </div>
            <Link 
              href="/events/create" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Event</span>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search events by title, description, location, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="bg-red-500/20 border border-red-500/30 text-red-300 font-semibold px-4 py-2 rounded-2xl hover:bg-red-500/30 transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-white/90 font-medium">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Events Grid/List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No events found</h3>
            <p className="text-white/70 mb-8">Try adjusting your search criteria or browse all events</p>
            <Link href="/events" className="btn-primary">
              Browse All Events
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
            {filteredEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                {viewMode === 'grid' ? (
                  <div className="event-card group bg-white/10 backdrop-blur-lg border border-white/20 hover:border-purple-500/50 transition-all duration-300">
                    <div className="relative h-48 mb-6 rounded-2xl overflow-hidden">
                      <img
                        src={event.image || 'https://picsum.photos/400/300?random=1'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://picsum.photos/400/300?random=1';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="badge bg-purple-500/90 text-white font-semibold px-3 py-1 rounded-full text-sm">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 p-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-white/90 line-clamp-3 text-sm leading-relaxed">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80 font-medium">
                          {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="font-semibold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="event-card group bg-white/10 backdrop-blur-lg border border-white/20 hover:border-purple-500/50 transition-all duration-300 p-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                        <img
                          src={event.image || 'https://picsum.photos/400/300?random=1'}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://picsum.photos/400/300?random=1';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {event.title}
                          </h3>
                          <span className="badge bg-purple-500/90 text-white font-semibold px-3 py-1 rounded-full text-sm ml-4">
                            {event.category}
                          </span>
                        </div>
                        <p className="text-white/90 mb-4 line-clamp-2 text-sm leading-relaxed">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80 font-medium">
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="font-semibold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Create Event CTA */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-16">
            <div className="card p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Can't find what you're looking for?</h3>
              <p className="text-white/70 mb-6">Create your own event and bring people together</p>
              <Link href="/events/create" className="btn-primary">
                Create Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 