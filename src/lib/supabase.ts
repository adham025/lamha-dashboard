import { createClient } from '@supabase/supabase-js'

// Anon key only — the dashboard authenticates a staff user and reads via RLS
// (staff-role policies, added in a later migration) or an admin Edge Function.
// The service_role key NEVER ships to the browser.
const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  // Surfaced clearly in dev / on Vercel if the env vars aren't set.
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env (local) or set them in Vercel → Settings → Environment Variables.',
  )
}

export const supabase = createClient(url, anonKey)
