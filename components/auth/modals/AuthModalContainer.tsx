import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useModalStore } from '@/src/store/modalStore';
import { LoginModal } from './LoginModal';
import { GetStartedModal } from './GetStartedModal';
import { CreateAccountModal } from './CreateAccountModal';

export function AuthModalContainer() {
  const { activeModal, closeModal } = useModalStore();

  return (
    <AnimatePresence mode="wait">
      {activeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            key={activeModal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-3xl p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[calc(100vh-2rem)]"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-elevated transition-colors z-[10]"
            >
              <X className="w-6 h-6 text-ink-muted" />
            </button>

            <div className="relative z-[5]">
              {activeModal === 'login' && <LoginModal />}
              {activeModal === 'getStarted' && <GetStartedModal />}
              {activeModal === 'createAccount' && <CreateAccountModal />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
