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
import Studios from './pages/Studios'
import Catalogue from './pages/Catalogue'
import Roles from './pages/Roles'
import RolesPermissions from './pages/RolesPermissions'
import Reports from './pages/Reports'
import SiteContent from './pages/SiteContent'
import { StaffPermissionsProvider, useStaffPermissions } from './context/StaffPermissions'
import { Payments, Editing, PrintDelivery, AllOrders } from './pages/queues'
import {
  Moderation,
  Discounts,
  Notifications,
  Settings,
} from './pages/sections'
import { canAccess, nav } from './lib/nav'
import PublicShell from './components/landing/PublicShell'
import LandingPage from './pages/landing/LandingPage'
import CmsDocumentPage from './pages/landing/CmsDocumentPage'
import ContactPage from './pages/landing/ContactPage'

const PUBLIC_PATHS = new Set(['/', '/about', '/contact', '/login'])

function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<CmsDocumentPage slug="about" />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/legal/:slug" element={<CmsDocumentPage />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const location = useLocation()
  const [session, setSession] = useState<Session | null>(null)
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

  useEffect(() => {
    if (!session) {
      setStaff(undefined)
      return
    }
    let cancelled = false
    setStaff(undefined)
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

  const isPublic =
    PUBLIC_PATHS.has(location.pathname) || location.pathname.startsWith('/legal/')

  if (!ready) return isPublic ? <PublicRoutes /> : Loader

  if (!session) return <PublicRoutes />

  if (staff === undefined) return isPublic ? <PublicRoutes /> : Loader

  if (staff === null) {
    if (isPublic) return <PublicRoutes />
    return <NotAuthorized email={session.user.email ?? ''} />
  }

  return (
    <StaffPermissionsProvider staff={staff}>
      <AuthenticatedRoutes staff={staff} />
    </StaffPermissionsProvider>
  )
}

const STAFF_HOME = '/today'

function AuthenticatedRoutes({ staff }: { staff: StaffMember }) {
  const { can } = useStaffPermissions()
  const allowed = (to: string) => {
    const item = nav.find((n) => n.to === to)
    return item ? canAccess(item, can) : true
  }
  const guard = (to: string, el: React.ReactNode) =>
    allowed(to) ? el : <Navigate to={STAFF_HOME} replace />

  return (
    <Routes>
      <Route path="/" element={<Navigate to={STAFF_HOME} replace />} />
      <Route path="/login" element={<Navigate to={STAFF_HOME} replace />} />
      <Route element={<Layout staff={staff} />}>
        <Route path="/today" element={<Overview />} />
        <Route path="/payments" element={guard('/payments', <Payments />)} />
        <Route path="/editing" element={guard('/editing', <Editing />)} />
        <Route path="/print" element={guard('/print', <PrintDelivery />)} />
        <Route path="/orders" element={guard('/orders', <AllOrders />)} />
        <Route path="/users" element={guard('/users', <Users />)} />
        <Route path="/moderation" element={guard('/moderation', <Moderation />)} />
        <Route path="/catalogue" element={guard('/catalogue', <Catalogue />)} />
        <Route path="/reports" element={guard('/reports', <Reports />)} />
        <Route path="/discounts" element={guard('/discounts', <Discounts />)} />
        <Route path="/notifications" element={guard('/notifications', <Notifications />)} />
        <Route path="/studios" element={guard('/studios', <Studios />)} />
        <Route path="/roles" element={guard('/roles', <Roles />)} />
        <Route path="/roles-permissions" element={guard('/roles-permissions', <RolesPermissions />)} />
        <Route path="/settings" element={guard('/settings', <Settings />)} />
        <Route path="/site" element={guard('/site', <SiteContent />)} />
        <Route path="*" element={<Navigate to={STAFF_HOME} replace />} />
      </Route>
    </Routes>
  )
}