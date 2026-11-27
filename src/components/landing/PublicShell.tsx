import { Outlet } from 'react-router-dom'
import { LanguageProvider } from '../../contexts/LanguageContext'
import { usePublicPageMeta } from '../../hooks/usePublicPageMeta'
import LandingFooter from './LandingFooter'
import LandingNav from './LandingNav'

/** Public marketing site shell (landing, about, contact, legal). */
function PublicPageMeta() {
  usePublicPageMeta()
  return null
}

export default function PublicShell() {
  return (
    <LanguageProvider>
      <PublicPageMeta />
      <div className="flex min-h-full flex-col bg-[var(--color-bg)] text-[var(--color-ink)]">
        <LandingNav />
        <div className="flex-1">
          <Outlet />
        </div>
        <LandingFooter />
      </div>
    </LanguageProvider>
  )
}