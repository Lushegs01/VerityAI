import { useEffect } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const {
    user,
    setAuth,
    setUser,
    logout: clearAuth,
    isLoading,
    setLoading,
    isDemo,
  } = useAuthStore()
  const utils = trpc.useUtils()

  // Skip the live session check entirely in demo mode so the locally
  // persisted user isn't clobbered by a 401 from /api/trpc/auth.me.
  const sessionQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: !isDemo,
  })

  const logoutMutation = trpc.auth.logout.useMutation({
    onSettled: async () => {
      clearAuth()
      await utils.auth.me.invalidate()
    },
  })

  useEffect(() => {
    if (isDemo) {
      setLoading(false)
      return
    }
    if (sessionQuery.isLoading) {
      setLoading(true)
      return
    }
    if (sessionQuery.data) {
      setAuth(sessionQuery.data)
      return
    }
    setUser(null)
    setLoading(false)
  }, [isDemo, sessionQuery.data, sessionQuery.isLoading, setAuth, setLoading, setUser])

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isDemo ? false : isLoading || sessionQuery.isLoading,
    logout: () => {
      if (isDemo) {
        clearAuth()
        return
      }
      logoutMutation.mutate()
    },
  }
}
