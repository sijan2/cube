import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getSession } from '@/lib/auth-client'
import { useAuth } from '@/providers/auth-provider'
import { useEffect } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const { refreshSession } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await refreshSession()
        const result = await getSession()
        const maybeData = result && typeof result === 'object' && 'data' in result ? (result as any).data : result
        const hasUser = !!(maybeData && typeof maybeData === 'object' && 'user' in maybeData)
        navigate({ to: hasUser ? '/dashboard' : '/login' })
      } catch {
        navigate({ to: '/login' })
      }
    }

    handleCallback()
  }, [navigate, refreshSession])

  return (
    null
  )
}