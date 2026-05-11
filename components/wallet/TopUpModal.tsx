import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWalletStore } from '@/src/store/walletStore';
import { cn } from '@/src/lib/utils';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const addFunds = useWalletStore((state) => state.addFunds);

  const presets = [2000, 5000, 10000];

  const handlePayment = async () => {
    const numAmount = parseInt(amount);
    if (!amount || isNaN(numAmount) || numAmount < 500) {
      toast.error('Minimum top-up amount is ₦500');
      return;
    }

    setIsProcessing(true);
    
    // Mock payment delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addFunds(numAmount);
    setIsProcessing(false);
    toast.success(`₦${numAmount.toLocaleString()} added to your wallet!`, {
      icon: <CheckCircle2 className="text-status-verified" />,
    });
    onClose();
    setAmount('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-display font-black tracking-tighter uppercase">Top Up Wallet</h2>
                <p className="text-ink-secondary text-sm font-medium">Add credits to your account instantly.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-elevated transition-colors">
                <X className="w-6 h-6 text-ink-muted" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Select Amount</label>
                <div className="grid grid-cols-3 gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className={cn(
                        "py-3 rounded-xl border font-mono font-bold transition-all active:scale-95",
                        amount === preset.toString()
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                          : "bg-surface-elevated border-surface-border text-ink-primary hover:border-primary/50"
                      )}
                    >
                      ₦{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-[0.2em]">Custom Amount</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-ink-muted">₦</div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min. 500"
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-surface-elevated border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono font-bold text-lg"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isProcessing}
                  onClick={handlePayment}
                  className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-light transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay with Squad
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-ink-muted mt-4 font-medium italic">
                  Secure processing by Squad Payment Gateway (GTCO)
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
