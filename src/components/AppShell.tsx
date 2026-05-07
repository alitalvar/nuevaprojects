import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { FolderKanban, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthProvider'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/team', label: 'Team', icon: Users },
]

export function AppShell() {
  const { user, signOut } = useAuth()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-wide">
            Nueva™
          </Link>
          <nav className="flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon
              const active = pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground',
                    active && 'bg-secondary text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:inline">{user?.email}</span>
            <Button variant="ghost" onClick={() => void signOut()}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
