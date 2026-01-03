'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/providers/auth-provider';
import { ORGANIZATION_NAME, getOrganizationInitials } from '@/lib/config';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/donors', label: 'Donors', icon: Users },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm shadow-gray-900/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="py-4 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all duration-300 truncate"
          >
            <span className="hidden sm:inline">{ORGANIZATION_NAME}</span>
            <span className="sm:hidden">{getOrganizationInitials()}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-300 rounded-lg relative group',
                    isActive
                      ? 'text-blue-600 bg-gradient-to-r from-blue-50/80 to-blue-100/50 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/80',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform duration-300',
                      isActive
                        ? 'text-blue-600 scale-110'
                        : 'group-hover:scale-110 group-hover:text-blue-600',
                    )}
                  />
                  <span className="relative">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-sm" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 text-sm text-gray-700">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                  <span className="max-w-[150px] truncate font-medium">
                    {user.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="gradient-primary text-white hover:shadow-md transition-shadow"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/80 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg',
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50/80',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t pt-2 mt-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600">
                    <UserIcon className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
