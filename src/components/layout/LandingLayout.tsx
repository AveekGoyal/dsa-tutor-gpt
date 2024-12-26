/**
 * @dev Layout component for landing pages
 * Features: consistent header/footer, flexible content area, full-height layout
 */

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * @dev Props interface for LandingLayout
 * @param children - React nodes to be rendered within the layout
 */
interface LandingLayoutProps {
  children: React.ReactNode;
}

/**
 * @dev Main landing page layout component
 * Provides consistent structure with navigation and footer for landing pages
 */
const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
