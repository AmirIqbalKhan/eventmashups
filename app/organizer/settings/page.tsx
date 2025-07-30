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

export default function OrganizerSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    autoPublish: false,
    payoutSchedule: 'weekly'
  });

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

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white/20 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.isOrganizer && !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-white">Organizer Settings ⚙️</h1>
            <Link href="/organizer" className="btn-outline">
              ← Back to Organizer
            </Link>
          </div>
          <p className="text-white/70">Manage your organizer preferences and settings</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Notification Settings */}
          <div className="dashboard-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div>
                  <h3 className="text-white font-semibold">Push Notifications</h3>
                  <p className="text-white/70 text-sm">Receive notifications about ticket sales and events</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications', !settings.notifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.notifications ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div>
                  <h3 className="text-white font-semibold">Email Updates</h3>
                  <p className="text-white/70 text-sm">Receive email notifications about your events</p>
                </div>
                <button
                  onClick={() => handleSettingChange('emailUpdates', !settings.emailUpdates)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emailUpdates ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Event Settings */}
          <div className="dashboard-card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Event Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div>
                  <h3 className="text-white font-semibold">Auto-Publish Events</h3>
                  <p className="text-white/70 text-sm">Automatically publish events when created</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoPublish', !settings.autoPublish)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.autoPublish ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.autoPublish ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl">
                <h3 className="text-white font-semibold mb-3">Payout Schedule</h3>
                <select
                  value={settings.payoutSchedule}
                  onChange={(e) => handleSettingChange('payoutSchedule', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-white/50 text-sm mt-2">How often you want to receive payouts</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="dashboard-card">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-white font-semibold">Save Settings</h3>
                <p className="text-white/70 text-sm">Apply your changes</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="btn-primary px-8 py-3 disabled:opacity-50"
              >
                {saving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 