/**
 * @dev Navigation bar component for the application
 * Features: responsive design, authentication state handling, route-based visibility
 */

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

/**
 * @dev Main navigation component that adapts based on authentication state
 * Handles conditional rendering based on current route and user session
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Don't show navbar on dashboard
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              DSAGPT Tutor
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {status !== 'loading' && !session && (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-indigo-700 hover:to-purple-700"
                >
                  Sign up
                </Link>
              </>
            )}
            {status !== 'loading' && session && (
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-indigo-700 hover:to-purple-700"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
