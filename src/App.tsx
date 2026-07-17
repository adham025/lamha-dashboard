import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { fetchStaff, type StaffMember } from './lib/db'
import Layout from './components/Layout'
import Login from './pages/Login'
import NotAuthorized from './pages/NotAuthorized'
import Overview from './pages/Overview'
import Users from './pages/Users'
import Orders from './pages/Orders'
import AiCost from './pages/AiCost'
import Studios from './pages/Studios'
import {
  Moderation,
  Subscriptions,
  Discounts,
  Notifications,
  Settings,
} from './pages/sections'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import RefundPolicy from './pages/legal/RefundPolicy'
import { canAccess, nav } from './lib/nav'

export default function App() {
  const location = useLocation()
  const [session, setSession] = useState<Session | null>(null)
  // undefined = role not resolved yet; null = resolved and NOT staff.
  const [staff, setStaff] = useState<StaffMember | null | undefined>(undefined)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Once signed in, resolve the staff record (role). RLS returns only the
  // caller's own row, so a non-staff account gets nothing → NotAuthorized.
  useEffect(() => {
    if (!session) {
      setStaff(undefined)
      return
    }
    let cancelled = false
    setStaff(undefined) // show the loader while (re)checking, never the no-access flash
    fetchStaff()
      .then((rows) => {
        if (cancelled) return
        setStaff(rows.find((r) => r.id === session.user.id && r.active) ?? null)
      })
      .catch(() => !cancelled && setStaff(null))
    return () => {
      cancelled = true
    }
  }, [session])

  const Loader = (
    <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
      Loading…
    </div>
  )

  // Public legal pages — opened straight from the mobile app, no auth, no
  // Supabase round-trip, checked before any of the session/staff gating below.
  if (location.pathname === '/legal/privacy') return <PrivacyPolicy />
  if (location.pathname === '/legal/terms') return <TermsOfService />
  if (location.pathname === '/legal/refund') return <RefundPolicy />

  if (!ready) return Loader

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Signed in, role still being fetched — show the loader, not the no-access screen.
  if (staff === undefined) return Loader

  // Resolved and definitely not a staff account.
  if (staff === null) {
    return <NotAuthorized email={session.user.email ?? ''} />
  }

  const role = staff.role
  const allowed = (to: string) => {
    const item = nav.find((n) => n.to === to)
    return item ? canAccess(item, role) : true
  }
  const guard = (to: string, el: React.ReactNode) =>
    allowed(to) ? el : <Navigate to="/" replace />

  return (
    <Routes>
      <Route element={<Layout staff={staff} />}>
        <Route path="/" element={<Overview />} />
        <Route path="/ai-cost" element={guard('/ai-cost', <AiCost />)} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={guard('/users', <Users />)} />
        <Route path="/moderation" element={guard('/moderation', <Moderation />)} />
        <Route path="/subscriptions" element={guard('/subscriptions', <Subscriptions />)} />
        <Route path="/discounts" element={guard('/discounts', <Discounts />)} />
        <Route path="/notifications" element={guard('/notifications', <Notifications />)} />
        <Route path="/studios" element={guard('/studios', <Studios />)} />
        <Route path="/settings" element={guard('/settings', <Settings />)} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
