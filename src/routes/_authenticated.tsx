import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { useAuth } from '@/contexts/AuthProvider'
import { useProjects } from '@/stores/useProjects'

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const loaded = useProjects((state) => state.loaded)
  const load = useProjects((state) => state.load)

  useEffect(() => {
    if (!loading && !user) void navigate({ to: '/login' })
  }, [loading, navigate, user])

  useEffect(() => {
    if (user && !loaded) void load()
  }, [load, loaded, user])

  if (loading || !user) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading Nueva™...</div>
  }

  return <AppShell />
}
