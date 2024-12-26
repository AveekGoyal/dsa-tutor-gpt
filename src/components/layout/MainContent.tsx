/**
 * @dev Main content wrapper component for all pages
 * Features: dynamic padding based on route, flexible content area
 */

'use client';

import { usePathname } from 'next/navigation';

/**
 * @dev Props interface for MainContent
 * @param children - React nodes to be rendered within the main content area
 */
interface MainContentProps {
  children: React.ReactNode;
}

/**
 * @dev Main content component that adapts layout based on current route
 * Applies different styling for dashboard vs other pages
 */
export default function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <main className={isDashboard ? "flex-1" : "flex-1 pt-16"}>
      {children}
    </main>
  );
}
