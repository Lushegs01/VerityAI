import { useAuthStore } from '@/src/store/authStore';
import { useWalletStore } from '@/src/store/walletStore';
import { LogOut, Bell, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { user, logout } = useAuthStore();
  const balance = useWalletStore((state) => state.balance);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-20 border-b border-surface-border bg-surface-card/50 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex-1 max-w-sm hidden md:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search forensic records..." 
            className="w-full bg-surface-base border border-surface-border rounded-xl py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest">Balance</div>
          <div className="text-sm font-mono font-black text-ink-primary">
            ₦{(balance / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <button className="relative p-2 text-ink-muted hover:text-ink-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface-card" />
        </button>

        <div className="h-8 w-[1px] bg-surface-border mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-ink-primary leading-none">{user?.full_name}</div>
            <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">{user?.company_name}</div>
          </div>
          <div className="group relative">
            <button className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center text-ink-primary hover:border-primary transition-all overflow-hidden">
              <User className="w-5 h-5" />
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-card border border-surface-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-ink-secondary hover:text-primary hover:bg-primary/5 transition-all text-left"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
