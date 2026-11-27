import { Outlet } from 'react-router-dom'
import { LanguageProvider } from '../../contexts/LanguageContext'
import LandingFooter from './LandingFooter'
import LandingNav from './LandingNav'

/** Public marketing site shell (landing, about, contact, legal). */
export default function PublicShell() {
  return (
    <LanguageProvider>
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