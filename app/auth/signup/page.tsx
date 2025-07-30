'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Dispatch auth change event
        window.dispatchEvent(new Event('auth-change'));
        // Force a page refresh to update navigation
        window.location.href = '/dashboard';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Signup failed');
      }
    } catch (error) {
      setError('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-gradient">
            Event Mashups
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-white/70">
            Join us and start creating amazing events
          </p>
        </div>

        {/* Signup Form */}
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  placeholder="First name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input"
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-white/70">
                I agree to the{' '}
                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-white/70">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 