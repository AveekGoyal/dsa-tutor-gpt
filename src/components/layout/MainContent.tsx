'use client';

import { usePathname } from 'next/navigation';

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <main className={isDashboard ? "flex-1" : "flex-1 pt-16"}>
      {children}
    </main>
  );
}
