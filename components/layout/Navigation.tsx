'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOrganizer: boolean;
  isAdmin: boolean;
}

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <nav className={`navbar ${isScrolled ? 'navbar-pill' : 'navbar-full'}`}>
        <div className={`navbar-content ${isScrolled ? 'navbar-content-pill' : 'navbar-content-full'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gradient">
                Event Mashups
              </Link>
            </div>
            <div className="animate-pulse bg-white/20 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-pill' : 'navbar-full'}`}>
      <div className={`navbar-content ${isScrolled ? 'navbar-content-pill' : 'navbar-content-full'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gradient">
              Event Mashups
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="nav-link"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="nav-link"
            >
              Events
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="nav-link"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="nav-link"
                >
                  Profile
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="nav-link"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="nav-link hover:text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="nav-link"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-sm px-6 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="space-y-2">
              <Link
                href="/"
                className="block nav-link py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/events"
                className="block nav-link py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block nav-link py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block nav-link py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="block nav-link py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left nav-link py-2 hover:text-red-400"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className="block nav-link py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block btn-primary text-sm px-6 py-2 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 