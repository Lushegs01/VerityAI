import { Routes, Route, Navigate, useLocation } from 'react-router'
import { Toaster } from 'react-hot-toast'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import AppShell from './components/layout/AppShell'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Verify from './pages/Verify'
import History from './pages/History'
import Wallet from './pages/Wallet'
import VerificationDetail from './pages/VerificationDetail'
import PublicBadge from './pages/PublicBadge'
import NotFound from './pages/NotFound'

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-base">
      <div className="relative">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary-600 to-accent-cyan shadow-glow">
          <ShieldCheck className="text-white" size={20} strokeWidth={2.5} />
        </div>
        <span className="absolute -inset-2 animate-ping rounded-2xl border-2 border-primary/40" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
        Loading VerityAI…
      </p>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--surface-elevated))',
            color: 'hsl(var(--ink-primary))',
            border: '1px solid hsl(var(--surface-border))',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            padding: '12px 14px',
            boxShadow: '0 12px 32px -12px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'hsl(var(--surface-elevated))',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'hsl(var(--surface-elevated))',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/badge/:token" element={<PublicBadge />} />
        <Route path="/dashboard" element={<ProtectedShell><Dashboard /></ProtectedShell>} />
        <Route path="/verify" element={<ProtectedShell><Verify /></ProtectedShell>} />
        <Route path="/history" element={<ProtectedShell><History /></ProtectedShell>} />
        <Route path="/wallet" element={<ProtectedShell><Wallet /></ProtectedShell>} />
        <Route path="/verification/:id" element={<ProtectedShell><VerificationDetail /></ProtectedShell>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
