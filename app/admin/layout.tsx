'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
