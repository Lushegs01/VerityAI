import { useEffect } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, setAuth, setUser, logout: clearAuth, isLoading, setLoading } = useAuthStore()
  const utils = trpc.useUtils()

  const sessionQuery = trpc.auth.me.useQuery(
    undefined,
    { retry: false, staleTime: 5 * 60 * 1000 }
  )

  const logoutMutation = trpc.auth.logout.useMutation({
    onSettled: async () => {
      clearAuth()
      await utils.auth.me.invalidate()
    },
  })

  useEffect(() => {
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
  }, [sessionQuery.data, sessionQuery.isLoading, setAuth, setLoading, setUser])

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || sessionQuery.isLoading,
    logout: () => logoutMutation.mutate(),
  }
}
