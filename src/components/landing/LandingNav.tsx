import { Globe, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { ICON_SIZE_NAV, ICON_STROKE } from '../../lib/icons'

export default function LandingNav() {
  const { t } = useTranslation()
  const { switchLanguage, isArabic } = useLanguage()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const linkClass = (path: string) =>
    'text-sm font-semibold transition-colors ' +
    (location.pathname === path
      ? 'text-[var(--color-accent)]'
      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]')

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)]/80 bg-[var(--color-panel)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0 text-lg font-extrabold tracking-tight text-[var(--color-ink)]">
          Lamha
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className={linkClass('/')}>
            {t('nav.home')}
          </Link>
          <Link to="/about" className={linkClass('/about')}>
            {t('nav.about')}
          </Link>
          <Link to="/contact" className={linkClass('/contact')}>
            {t('nav.contact')}
          </Link>
          <button
            type="button"
            onClick={switchLanguage}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-accent)]"
            aria-label={t('nav.switchLangAria')}
          >
            <Globe size={ICON_SIZE_NAV} strokeWidth={ICON_STROKE} />
            <span>{isArabic ? t('lang.english') : t('lang.arabic')}</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={switchLanguage}
            className="rounded-lg p-2 text-[var(--color-muted)]"
            aria-label={t('nav.switchLangAria')}
          >
            <Globe size={20} strokeWidth={ICON_STROKE} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-[var(--color-muted)]"
            aria-expanded={open}
          >
            {open ? <X size={22} strokeWidth={ICON_STROKE} /> : <Menu size={22} strokeWidth={ICON_STROKE} />}
          </button>
        </div>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-10 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={
          'border-t border-[var(--color-border)] bg-[var(--color-panel)] px-5 py-3 md:hidden ' +
          (open ? 'relative z-20' : 'hidden')
        }
      >
        <MobileNavLink to="/" label={t('nav.home')} className={linkClass('/')} />
        <MobileNavLink to="/about" label={t('nav.about')} className={linkClass('/about')} />
        <MobileNavLink to="/contact" label={t('nav.contact')} className={linkClass('/contact')} />
      </div>
    </header>
  )
}

function MobileNavLink({ to, label, className }: { to: string; label: string; className: string }) {
  return (
    <Link to={to} className={'block py-2 ' + className}>
      {label}
    </Link>
  )
}