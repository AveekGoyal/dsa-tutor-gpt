/**
 * @dev Layout component for dashboard pages
 * Features: full-height layout, background styling, flexible content area
 */

import React from 'react';

/**
 * @dev Props interface for DashboardLayout
 * @param children - React nodes to be rendered within the layout
 */
interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * @dev Main dashboard layout component that wraps dashboard pages
 * Provides consistent styling and structure for dashboard content
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
