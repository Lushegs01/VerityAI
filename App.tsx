import React from 'react';
import { Landing } from '@/src/pages/Landing';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { AnimatePresence, motion } from 'motion/react';

// Page Imports
import { Login } from '@/src/pages/Auth/Login';
import { Register } from '@/src/pages/Auth/Register';
import { Dashboard } from '@/src/pages/Dashboard';
import { Verify } from '@/src/pages/Verify';
import { Result } from '@/src/pages/Verify/Result';
import { Bulk } from '@/src/pages/Bulk';
import { BulkResult } from '@/src/pages/Bulk/Result';
import { BadgePage } from '@/src/pages/Public/Badge'; 
import { History } from '@/src/pages/History';
import { WalletPage } from '@/src/pages/Wallet';
import { AuthModalContainer } from '@/src/components/auth/modals/AuthModalContainer';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/badge/:token" element={<PageTransition><BadgePage /></PageTransition>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/verify" element={<PageTransition><Verify /></PageTransition>} />
          <Route path="/verify/:id/result" element={<PageTransition><Result /></PageTransition>} />
          <Route path="/bulk" element={<PageTransition><Bulk /></PageTransition>} />
          <Route path="/bulk/:jobId" element={<PageTransition><BulkResult /></PageTransition>} />
          <Route path="/history" element={<PageTransition><History /></PageTransition>} />
          <Route path="/wallet" element={<PageTransition><WalletPage /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-base text-ink-primary font-body">
        <AnimatedRoutes />
        <AuthModalContainer />
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              fontWeight: 500,
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
