'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  location: string;
  address?: string;
  startDate: string;
  endDate: string;
  lowestPrice: number;
  highestPrice: number;
  organizerName: string;
  organizerEmail: string;
  ticketCount: number;
  soldTickets: number;
  tags: string[];
}

interface Ticket {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
  total: number;
}

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [splitPayment, setSplitPayment] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    checkAuthStatus();
  }, [params.id]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
        setTickets(data.tickets || []);
        if (data.tickets && data.tickets.length > 0) {
          setSelectedTicket(data.tickets[0].id);
        }
      }
    } catch (error) {
      console.error('Event details fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getAvailabilityPercentage = () => {
    if (!event) return 0;
    return Math.round((event.soldTickets / event.ticketCount) * 100);
  };

  const getTotalPrice = () => {
    if (!selectedTicket) return 0;
    const ticket = tickets.find(t => t.id === selectedTicket);
    return ticket ? ticket.price * quantity : 0;
  };

  const getFirstPaymentAmount = () => {
    if (!selectedTicket) return 0;
    const ticket = tickets.find(t => t.id === selectedTicket);
    return ticket ? ticket.price : 0;
  };

  const handleBuyTickets = async () => {
    if (!selectedTicket || !user) {
      alert('Please select a ticket type and make sure you are logged in.');
      return;
    }

    setBuying(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event?.id,
          ticketTierId: selectedTicket,
          quantity: quantity,
          splitPayment: splitPayment
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process checkout');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-96 bg-white/20 rounded-3xl"></div>
                <div className="h-64 bg-white/20 rounded-3xl"></div>
              </div>
              <div className="h-96 bg-white/20 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container-custom py-12">
          <div className="text-center">
            <div className="text-8xl mb-6">❌</div>
            <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
            <p className="text-white/70 mb-8">The event you're looking for doesn't exist or has been removed.</p>
            <Link href="/events" className="btn-primary">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container-custom py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-white/70">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li className="text-white/50">/</li>
            <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
            <li className="text-white/50">/</li>
            <li className="text-white font-medium">{event.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'}
                alt={event.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-purple-500/90 text-white rounded-full text-sm font-semibold">
                  {event.category}
                </span>
              </div>
              <div className="absolute top-6 right-6">
                <span className="px-4 py-2 bg-green-500/90 text-white rounded-full text-sm font-semibold">
                  {getAvailabilityPercentage()}% sold
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="dashboard-card">
              <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
              
              <div className="flex items-center text-white/70 mb-6">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Organized by {event.organizerName}</span>
              </div>

              <div className="prose prose-lg max-w-none text-white/80 mb-8">
                <p>{event.description}</p>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 p-6 bg-white/5 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Date & Time</h3>
                    <p className="text-white/80">{formatDate(event.startDate)}</p>
                    <p className="text-white/80">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white/5 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Location</h3>
                    <p className="text-white/80">{event.location}</p>
                    {event.address && <p className="text-white/60 text-sm">{event.address}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Purchase Sidebar */}
          <div className="space-y-6">
            <div className="dashboard-card">
              <h2 className="text-2xl font-bold text-white mb-6">Get Tickets</h2>
              
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedTicket === ticket.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/20 bg-white/5 hover:border-white/30'
                      }`}
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-white font-semibold">{ticket.name}</h3>
                        <span className="text-2xl font-bold text-purple-400">
                          {formatCurrency(ticket.price)}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mb-3">{ticket.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">
                          {ticket.available} of {ticket.total} available
                        </span>
                        <span className="text-green-400 text-sm font-semibold">
                          {Math.round(((ticket.total - ticket.available) / ticket.total) * 100)}% sold
                        </span>
                      </div>
                    </div>
                  ))}

                  {selectedTicket && (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-white font-semibold">Quantity:</label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20"
                          >
                            -
                          </button>
                          <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {quantity > 1 && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <input
                              type="checkbox"
                              id="splitPayment"
                              checked={splitPayment}
                              onChange={(e) => setSplitPayment(e.target.checked)}
                              className="w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="splitPayment" className="text-white/90 text-sm">
                              <span className="font-semibold text-blue-400">Group Payment Option</span>
                              <br />
                              <span className="text-white/70">Multiple people can contribute any amount to buy tickets together</span>
                            </label>
                          </div>

                          {splitPayment && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                              <div className="text-green-400 font-semibold mb-2">Group Payment Plan</div>
                              <div className="text-white/80 text-sm space-y-1">
                                <div>Total needed: {formatCurrency(getTotalPrice())}</div>
                                <div>Contributors needed: {quantity} people</div>
                                <div className="text-green-300 text-xs mt-2">
                                  ✓ Each person can contribute any amount they want
                                </div>
                                <div className="text-green-300 text-xs">
                                  ✓ Tickets will be allocated only when full amount is collected
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={handleBuyTickets}
                        disabled={buying || !user}
                        className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50"
                      >
                        {buying ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : !user ? (
                          'Login to Buy Tickets'
                        ) : (
                          'Buy Tickets'
                        )}
                      </button>

                      {!user && (
                        <p className="text-white/60 text-sm text-center">
                          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
                            Sign in
                          </Link> to purchase tickets
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/70">No tickets available for this event.</p>
                </div>
              )}
            </div>

            {/* Event Stats */}
            <div className="dashboard-card">
              <h3 className="text-xl font-bold text-white mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Tickets:</span>
                  <span className="text-white font-semibold">{event.ticketCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Sold:</span>
                  <span className="text-green-400 font-semibold">{event.soldTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Available:</span>
                  <span className="text-white font-semibold">{event.ticketCount - event.soldTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Price Range:</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(event.lowestPrice)} - {formatCurrency(event.highestPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 