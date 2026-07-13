import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import {
  AiCost,
  Orders,
  Users,
  Moderation,
  Subscriptions,
  Promotions,
  Staff,
  Settings,
} from './pages/sections'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
        Loading…
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout email={session.user.email ?? 'staff'} />}>
        <Route path="/" element={<Overview />} />
        <Route path="/ai-cost" element={<AiCost />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/moderation" element={<Moderation />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
