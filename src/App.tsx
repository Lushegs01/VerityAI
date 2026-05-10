import { Routes, Route, Navigate } from 'react-router'
import { Toaster } from 'react-hot-toast'
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppLayout() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/history" element={<History />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/verification/:id" element={<VerificationDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161B27',
            color: '#F0F4FF',
            border: '1px solid #1E2535',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#00C896',
              secondary: '#161B27',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF4757',
              secondary: '#161B27',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/badge/:token" element={<PublicBadge />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  )
}
