import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthProvider'
import { isSupabaseConfigured } from '@/integrations/supabase/client'

export const Route = createFileRoute('/login')({
  ssr: false,
  head: () => ({
    meta: [{ title: 'Login — Nueva™' }],
  }),
  component: LoginRoute,
})

function LoginRoute() {
  const navigate = useNavigate()
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && user) void navigate({ to: '/' })
  }, [loading, navigate, user])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    try {
      if (mode === 'sign-in') {
        await signIn(email, password)
      } else {
        await signUp(email, password, displayName)
        setMessage('Check your inbox to confirm your email before signing in.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.')
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
        <p className="mb-2 text-sm uppercase text-muted-foreground">Nueva™</p>
        <h1 className="text-2xl font-semibold">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
        {!isSupabaseConfigured ? (
          <div className="mt-5 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            Supabase is not configured yet. Add your project URL and anon key to <code>.env.local</code>, then restart the dev server.
          </div>
        ) : null}
        <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event)}>
          {mode === 'sign-up' ? (
            <Input required placeholder="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          ) : null}
          <Input required type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input required type="password" minLength={8} placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          <Button type="submit" disabled={!isSupabaseConfigured}>
            {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>
        <Button className="mt-3 w-full" variant="outline" disabled={!isSupabaseConfigured} onClick={() => void signInWithGoogle()}>
          <Chrome className="size-4" />
          Continue with Google
        </Button>
        <Button className="mt-4 w-full" variant="ghost" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
          {mode === 'sign-in' ? 'Need an account?' : 'Already have an account?'}
        </Button>
      </section>
    </main>
  )
}
