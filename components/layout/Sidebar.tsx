import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Search, 
  Layers, 
  History, 
  Wallet, 
  Settings, 
  Briefcase,
  Users,
  Code,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useWalletStore } from '@/src/store/walletStore';
import { useAuthStore } from '@/src/store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Search, label: 'Verify Certificate', path: '/verify' },
  { icon: Layers, label: 'Bulk Verify', path: '/bulk' },
  { icon: History, label: 'History', path: '/history' },
  { icon: ShieldCheck, label: 'Badge', path: '/badge/sample' },
];

const secondaryItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const balance = useWalletStore((state) => state.balance);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-surface-border bg-surface-card h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2">
        <ShieldCheck className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(5,150,105,0.15)]" />
        <span className="text-xl font-display font-black tracking-tighter uppercase">Verity</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
        <div className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Navigation</div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                location.pathname === item.path 
                  ? "bg-primary/10 text-primary border-l-4 border-l-primary" 
                  : "text-ink-secondary hover:text-ink-primary hover:bg-surface-elevated border-l-4 border-l-transparent"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                location.pathname === item.path ? "text-primary" : "text-ink-muted group-hover:text-ink-primary"
              )} />
              <span className="text-sm font-bold">{item.label}</span>
              {location.pathname === item.path && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              )}
            </Link>
          ))}
        </div>

        <div className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Preferences</div>
          {secondaryItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group border-l-4 border-l-transparent",
                location.pathname === item.path 
                  ? "bg-primary/10 text-primary border-l-primary" 
                  : "text-ink-secondary hover:text-ink-primary hover:bg-surface-elevated"
              )}
            >
              <item.icon className="w-5 h-5 text-ink-muted group-hover:text-ink-primary transition-colors" />
              <span className="text-sm font-bold">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 space-y-4 border-t border-surface-border">
        <div className="p-4 rounded-2xl bg-surface-base border border-surface-border">
          <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-1">Wallet Balance</div>
          <div className="text-lg font-mono font-black text-ink-primary">
            ₦{(balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <Link to="/wallet" className="mt-2 block text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">
            Top Up Account
          </Link>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink-secondary hover:text-status-fake hover:bg-status-fake-bg/10 transition-all group"
        >
          <LogOut className="w-5 h-5 text-ink-muted group-hover:text-status-fake transition-colors" />
          <span className="text-sm font-bold">Logout Session</span>
        </button>
      </div>
    </aside>
  );
}
