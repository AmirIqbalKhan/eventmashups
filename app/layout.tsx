import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Event Mashups - Discover Amazing Events',
  description: 'Connect, celebrate, and create unforgettable memories with events that bring people together',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        <Navigation />
        <main>
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-8 sm:py-12 mt-16 sm:mt-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Company Info */}
              <div className="sm:col-span-2">
                <div className="mb-4">
                  <span className="text-lg sm:text-xl font-bold text-gradient">Event Mashups</span>
                </div>
                <p className="text-white/70 mb-6 max-w-md text-sm sm:text-base">
                  Connect, celebrate, and create unforgettable memories with events that bring people together.
                </p>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm sm:text-base">Quick Links</h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li><a href="/events" className="text-white/70 hover:text-white transition-colors">Browse Events</a></li>
                  <li><a href="/dashboard" className="text-white/70 hover:text-white transition-colors">Dashboard</a></li>
                  <li><a href="/profile" className="text-white/70 hover:text-white transition-colors">Profile</a></li>
                </ul>
              </div>
              
              {/* Support */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm sm:text-base">Support</h3>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
              <p className="text-white/60 text-xs sm:text-sm">
                © 2024 Event Mashups. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 