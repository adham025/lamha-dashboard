import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
    // On success, the onAuthStateChange listener in App swaps to the dashboard.
  }

  return (
    <div className="flex h-full items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-7"
      >
        <div className="mb-6">
          <div className="text-[17px] font-semibold tracking-tight">Lamha</div>
          <div className="text-xs text-[var(--color-muted)]">Operations</div>
        </div>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 mb-5 text-sm text-[var(--color-muted)]">Staff access only.</p>

        <label className="mb-1 block text-xs font-semibold text-[var(--color-muted)]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          placeholder="you@lamha.app"
        />

        <label className="mb-1 block text-xs font-semibold text-[var(--color-muted)]">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
          placeholder="••••••••"
        />

        {error && (
          <div className="mb-4 rounded-xl bg-[var(--color-accent-soft)] px-3.5 py-2.5 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
