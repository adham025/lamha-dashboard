import { supabase } from '../lib/supabase'

export default function NotAuthorized({ email }: { email: string }) {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-7 text-center">
        <h1 className="text-xl font-extrabold">No dashboard access</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          <span className="font-semibold">{email}</span> isn’t a staff account. Ask a super-admin
          to create a studio account for you.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 w-full rounded-full bg-[var(--color-accent)] py-3 text-sm font-bold text-white hover:opacity-90"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
