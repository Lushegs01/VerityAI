import { useEffect, useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, setAuth, logout, isLoading, setLoading } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  const { data: sessionData, isLoading: sessionLoading } = trpc.auth.me.useQuery(
    undefined,
    { enabled: !initialized, retry: false }
  )

  const { data: userData } = trpc.auth.getExtendedUser.useQuery(
    undefined,
    { enabled: !!sessionData, retry: false }
  )

  useEffect(() => {
    if (!sessionLoading) {
      setInitialized(true)
      if (sessionData) {
        const extendedUser = {
          ...sessionData,
          ...userData,
          fullName: userData?.fullName || sessionData.name,
          walletBalance: userData?.walletBalance || '0',
          plan: userData?.plan || 'free',
          verificationCount: userData?.verificationCount || 0,
        }
        setAuth(extendedUser as any)
      } else {
        setLoading(false)
      }
    }
  }, [sessionData, userData, sessionLoading])

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || !initialized,
    logout,
  }
}
