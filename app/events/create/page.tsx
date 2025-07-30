'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOrganizer: boolean;
  isAdmin: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  image: string;
  tags: string[];
  ticketTypes: TicketType[];
}

interface TicketType {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    address: '',
    startDate: '',
    endDate: '',
    image: '',
    tags: [],
    ticketTypes: [
      {
        name: 'General Admission',
        description: 'Standard event ticket',
        price: 0,
        quantity: 100,
      },
    ],
  });

  const categories = [
    { value: 'music', label: 'Music', icon: '🎵', color: 'from-purple-500 to-pink-500' },
    { value: 'technology', label: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { value: 'sports', label: 'Sports', icon: '⚽', color: 'from-green-500 to-emerald-500' },
    { value: 'business', label: 'Business', icon: '💼', color: 'from-indigo-500 to-purple-500' },
    { value: 'arts', label: 'Arts', icon: '🎨', color: 'from-pink-500 to-rose-500' },
    { value: 'food', label: 'Food & Drink', icon: '🍽️', color: 'from-orange-500 to-red-500' },
    { value: 'education', label: 'Education', icon: '📚', color: 'from-yellow-500 to-orange-500' },
    { value: 'health', label: 'Health & Wellness', icon: '🧘', color: 'from-emerald-500 to-teal-500' },
    { value: 'other', label: 'Other', icon: '🎪', color: 'from-gray-500 to-slate-500' },
  ];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        if (!userData.isOrganizer && !userData.isAdmin) {
          router.push('/dashboard');
          return;
        }
        setUser(userData);
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

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketType, value: any) => {
    const updatedTicketTypes = [...formData.ticketTypes];
    updatedTicketTypes[index] = {
      ...updatedTicketTypes[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      ticketTypes: updatedTicketTypes,
    }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: [
        ...prev.ticketTypes,
        {
          name: '',
          description: '',
          price: 0,
          quantity: 100,
        },
      ],
    }));
  };

  const removeTicketType = (index: number) => {
    if (formData.ticketTypes.length > 1) {
      setFormData(prev => ({
        ...prev,
        ticketTypes: prev.ticketTypes.filter((_, i) => i !== index),
      }));
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getCategoryKeywords = (category: string) => {
    const categoryKeywords = {
      'music': 'concert,music,performance',
      'technology': 'technology,computer,digital',
      'business': 'business,meeting,office',
      'sports': 'sports,athletics,competition',
      'arts': 'art,gallery,exhibition',
      'food': 'food,cuisine,restaurant',
      'education': 'education,learning,classroom',
      'health': 'health,wellness,fitness',
      'entertainment': 'entertainment,party,celebration',
      'other': 'event,celebration,people'
    };
    
    return categoryKeywords[category as keyof typeof categoryKeywords] || 'event,celebration';
  };

  const generateEventImage = (category: string) => {
    // Simple, reliable placeholder images for each category
    const categoryImages = {
      'music': 'https://picsum.photos/1600/900?random=1',
      'technology': 'https://picsum.photos/1600/900?random=2',
      'business': 'https://picsum.photos/1600/900?random=3',
      'sports': 'https://picsum.photos/1600/900?random=4',
      'arts': 'https://picsum.photos/1600/900?random=5',
      'food': 'https://picsum.photos/1600/900?random=6',
      'education': 'https://picsum.photos/1600/900?random=7',
      'health': 'https://picsum.photos/1600/900?random=8',
      'entertainment': 'https://picsum.photos/1600/900?random=9',
      'other': 'https://picsum.photos/1600/900?random=10'
    };
    
    return categoryImages[category as keyof typeof categoryImages] || categoryImages['other'];
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Event title is required';
    if (!formData.description.trim()) return 'Event description is required';
    if (!formData.category) return 'Please select a category';
    if (!formData.location.trim()) return 'Event location is required';
    if (!formData.startDate) return 'Start date is required';
    if (!formData.endDate) return 'End date is required';
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return 'End date must be after start date';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    try {
      // If no image is provided, generate a reliable Unsplash image based on category
      let finalImageUrl = formData.image.trim();
      if (!finalImageUrl) {
        finalImageUrl = generateEventImage(formData.category);
      }

      const eventData = {
        ...formData,
        image: finalImageUrl
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setTimeout(() => {
          router.push(`/events/${data.event.id}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create event');
      }
    } catch (error) {
      setError('An error occurred while creating the event');
    } finally {
      setSubmitting(false);
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
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-white/20 rounded-3xl"></div>
                ))}
              </div>
              <div className="h-96 bg-white/20 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Create New Event</h1>
              <p className="text-white/70 text-lg">Share your event with the world</p>
            </div>
            <Link href="/events" className="btn-outline text-sm px-4 py-2 text-center">
              ← Back to Events
            </Link>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/10 text-white/50'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 sm:w-12 h-1 mx-2 sm:mx-4 ${
                    currentStep > step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-white/70 text-sm sm:text-base">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Event Details' :
                currentStep === 2 ? 'Ticket Information' :
                'Review & Publish'
              }
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <div className="space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <div className="dashboard-card">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label className="form-label">Event Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input"
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="form-label">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input min-h-[120px] resize-none"
                      placeholder="Describe your event..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          category: e.target.value,
                          image: generateEventImage(e.target.value)
                        });
                      }}
                      className="input"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input"
                      placeholder="City, State"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="form-label">Full Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input"
                      placeholder="Street address, city, state, zip"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">End Date *</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="dashboard-card">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Tags</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Add tags (press Enter to add)"
                    onKeyDown={handleTagInput}
                    className="input"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="badge bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-purple-400 hover:text-purple-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 sm:space-y-8">
              {/* Ticket Types */}
              <div className="dashboard-card">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Ticket Types</h2>
                <div className="space-y-6">
                  {formData.ticketTypes.map((ticket, index) => (
                    <div key={index} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-semibold text-white">
                          Ticket Type {index + 1}
                        </h3>
                        {formData.ticketTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTicketType(index)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2">Name *</label>
                          <input
                            type="text"
                            required
                            value={ticket.name}
                            onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                            placeholder="e.g., General Admission"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Price *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={ticket.price}
                            onChange={(e) => handleTicketTypeChange(index, 'price', parseFloat(e.target.value))}
                            placeholder="0.00"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Quantity *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={ticket.quantity}
                            onChange={(e) => handleTicketTypeChange(index, 'quantity', parseInt(e.target.value))}
                            placeholder="100"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2">Description</label>
                          <input
                            type="text"
                            value={ticket.description}
                            onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                            placeholder="Brief description"
                            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addTicketType}
                  className="btn-secondary text-sm w-full"
                >
                  + Add Ticket Type
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 sm:space-y-8">
              {/* Event Summary */}
              <div className="dashboard-card">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Event Summary</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Title:</span>
                    <span className="font-medium text-white">
                      {formData.title || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Category:</span>
                    <span className="font-medium text-white">
                      {formData.category ? categories.find(c => c.value === formData.category)?.label : 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Location:</span>
                    <span className="font-medium text-white">
                      {formData.location || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Date:</span>
                    <span className="font-medium text-white">
                      {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Ticket Types:</span>
                    <span className="font-medium text-white">
                      {formData.ticketTypes.length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Tags:</span>
                    <span className="font-medium text-white">
                      {formData.tags.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              <div className="dashboard-card">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Event Image Preview</h3>
                <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                  <img
                    src={formData.image || `https://picsum.photos/400/200?random=${Math.floor(Math.random() * 100)}`}
                    alt="Event Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://picsum.photos/400/200?random=${Math.floor(Math.random() * 100)}`;
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 sm:mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="btn-outline text-sm px-4 py-2"
              >
                Previous
              </button>
            )}
            {currentStep < 3 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="btn-primary text-sm px-4 py-2"
              >
                Next Step →
              </button>
            )}
            {currentStep === 3 && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Event...</span>
                  </div>
                ) : (
                  '🎉 Create Event'
                )}
              </button>
            )}
          </div>

          <p className="text-xs text-white/50 mt-3 text-center">
            By creating this event, you agree to our terms of service
          </p>
        </form>
      </div>
    </div>
  );
} 