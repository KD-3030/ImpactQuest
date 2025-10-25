'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  Sprout, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Users,
  Plus,
  CheckCircle,
  Sparkles,
  Home
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: 'admin' | 'user';
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Manage Quests', href: '/admin/quests', icon: Map },
  { label: 'Create Quest', href: '/admin/create-quest', icon: Plus },
  { label: 'Submissions', href: '/admin/submissions', icon: CheckCircle },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const userNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Browse Quests', href: '/dashboard/quests', icon: Map },
  { label: 'My Garden', href: '/dashboard/garden', icon: Sprout },
  { label: 'My Submissions', href: '/dashboard/submissions', icon: FileText },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = role === 'admin' ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] rounded-lg shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {isMobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isMobileMenuOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-[#100720] via-[#31087B] to-[#100720] shadow-2xl z-40 border-r-2 border-[#FA2FB5]/30
          w-64 flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#FA2FB5]/30">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-8 h-8 text-[#FA2FB5]" />
            <h1 className="text-xl font-bold text-[#FA2FB5]">ImpactQuest</h1>
          </div>
          
          {/* Role Badge */}
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            ${role === 'admin' ? 'bg-gradient-to-r from-[#FA2FB5] to-[#31087B]' : 'bg-gradient-to-r from-[#FFC23C] to-[#FA2FB5]'}
            text-white shadow-lg
          `}>
            {role === 'admin' ? (
              <>
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Quest Master</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Quest Hunter</span>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all shadow-lg relative overflow-hidden
                      ${active 
                        ? 'bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C] text-white font-medium' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white border-2 border-[#FA2FB5]/20 hover:border-[#FA2FB5]/50'
                      }
                    `}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-[#FA2FB5] to-[#FFC23C]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto relative z-10"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#FA2FB5]/30 space-y-3">
          <div className="px-2">
            <ConnectButton showBalance={false} chainStatus="none" />
          </div>
          
          <button
            onClick={handleBackToHome}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#FFC23C] hover:bg-[#FFC23C]/20 transition-all border-2 border-[#FFC23C]/30 hover:border-[#FFC23C]"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#FA2FB5] hover:bg-[#FA2FB5]/20 transition-all border-2 border-[#FA2FB5]/30 hover:border-[#FA2FB5]"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
