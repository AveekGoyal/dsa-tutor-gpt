/**
 * @dev Dashboard page component with chat interface
 * Features: authentication check, collapsible sidebar, chat interface integration
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import DashboardLayout from '@/components/layout/DashboardLayout';

/**
 * @dev Main dashboard page component
 * Handles authentication state, sidebar state, and chat interface layout
 * Redirects to login if user is not authenticated
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-screen bg-gray-50">
        <ChatSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1">
          <ChatInterface sidebarCollapsed={isSidebarCollapsed} />
        </main>
      </div>
    </DashboardLayout>
  );
}
