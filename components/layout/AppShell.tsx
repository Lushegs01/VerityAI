import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { 
  Menu, 
  X, 
  Layout, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Wallet,
  User
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/store/authStore';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: Layout, path: '/' },
    { label: 'Verify', icon: ShieldCheck, path: '/verify' },
    { label: 'Bulk', icon: Layers, path: '/bulk' },
    { label: 'History', icon: Clock, path: '/history' },
    { label: 'Wallet', icon: Wallet, path: '/wallet' },
  ];

  return (
    <div className="flex min-h-screen bg-surface-base text-ink-primary relative flex-col">
      {/* Demo Banner */}
      <div className="h-8 bg-surface-elevated border-b border-surface-border flex items-center justify-center px-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        <div className="relative z-10 flex items-center gap-2 text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full bg-status-verified animate-ping" />
          Demo Mode — Logged in as <span className="text-primary">{user?.email || 'demo@verity.ng'}</span>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {/* Background Decor */}
        <div className="fixed top-0 left-0 w-full h-full noise-overlay opacity-[0.03] pointer-events-none z-[9999]" />
        
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-surface-base/80 backdrop-blur-sm z-[100] lg:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-72 bg-surface-card z-[101] lg:hidden border-r border-surface-border shadow-2xl"
              >
                <div className="absolute top-4 right-4">
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-ink-muted hover:text-primary transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <Sidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden h-16 border-b border-surface-border bg-surface-card/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-ink-muted">
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-xl font-display font-black tracking-tighter uppercase text-primary">Verity</div>
            <Link to="/profile" className="w-10 h-10 rounded-full border border-surface-border flex items-center justify-center bg-surface-elevated text-ink-muted">
              <User className="w-5 h-5" />
            </Link>
          </header>

          <TopBar />
          <main className="flex-1 p-4 md:p-8 lg:p-10 mb-20 lg:mb-0">
            {children}
          </main>

          {/* Bottom Tab Bar (Mobile Only) */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface-card/80 backdrop-blur-xl border-t border-surface-border px-6 flex items-center justify-between z-[60] pb-safe">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    isActive ? "text-primary scale-110" : "text-ink-muted"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "fill-primary/10")} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
