'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { LoadingSpinner } from '@/components/ui';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();
  const { role, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else if (isAuthenticated && role !== 'admin') {
      router.push('/dashboard');
    } else if (isConnected && !role) {
      router.push('/login');
    }
  }, [isConnected, role, isAuthenticated, router]);

  if (!isConnected || role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#100720] via-[#31087B] to-[#100720]">
        <LoadingSpinner size="lg" color="primary" label="Verifying admin access..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#100720] via-[#31087B] to-[#100720]">
      <Sidebar role="admin" />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
