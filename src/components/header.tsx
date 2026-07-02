'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Coins, LogOut, User, Settings, Video, Image, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
  subscriptionTier: string | null;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Studio
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/studio"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/studio')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Image className="w-4 h-4" />
                  <span>Studio</span>
                </div>
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/pricing')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Pricing
              </Link>
              {(user.role === 'master' || user.role === 'admin') && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                </Link>
              )}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Credits Display */}
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <Coins className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">
                    {user.subscriptionTier === 'unlimited' || user.role === 'master'
                      ? '∞'
                      : user.credits.toLocaleString()}
                  </span>
                </div>

                {/* User Menu */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.subscriptionTier} Plan
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
                <span className="text-sm font-medium">Credits</span>
                <span className="text-sm font-semibold text-blue-600">
                  {user.subscriptionTier === 'unlimited' || user.role === 'master'
                    ? '∞'
                    : user.credits.toLocaleString()}
                </span>
              </div>
              <Link
                href="/studio"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/studio') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Studio
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/pricing') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              {(user.role === 'master' || user.role === 'admin') && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-left text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
