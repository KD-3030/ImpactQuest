'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';

type Role = 'admin' | 'user' | null;

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin wallet addresses (add your admin addresses here)
const ADMIN_ADDRESSES = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', // Example admin address
  // Add more admin addresses as needed
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setRole(null);
      return;
    }

    // Check if saved role exists in localStorage
    const savedRole = localStorage.getItem(`role_${address.toLowerCase()}`);
    
    if (savedRole === 'admin' || savedRole === 'user') {
      setRole(savedRole as Role);
    } else {
      // Auto-assign admin role if address is in admin list
      if (ADMIN_ADDRESSES.some(addr => addr.toLowerCase() === address.toLowerCase())) {
        setRole('admin');
        localStorage.setItem(`role_${address.toLowerCase()}`, 'admin');
      }
    }
  }, [address, isConnected]);

  const handleSetRole = (newRole: Role) => {
    setRole(newRole);
    if (address && newRole) {
      localStorage.setItem(`role_${address.toLowerCase()}`, newRole);
    }
  };

  const logout = () => {
    if (address) {
      localStorage.removeItem(`role_${address.toLowerCase()}`);
    }
    setRole(null);
  };

  const isAuthenticated = isConnected && role !== null;

  return (
    <AuthContext.Provider value={{ role, setRole: handleSetRole, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
