import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function LandingFooter() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-panel)] py-10 text-center text-xs text-[var(--color-muted)]">
      <div className="flex flex-wrap justify-center gap-5 font-semibold">
        <Link to="/legal/privacy" className="hover:text-[var(--color-accent)]">
          {t('footer.privacy')}
        </Link>
        <Link to="/legal/terms" className="hover:text-[var(--color-accent)]">
          {t('footer.terms')}
        </Link>
        <Link to="/legal/refund" className="hover:text-[var(--color-accent)]">
          {t('footer.refunds')}
        </Link>
      </div>
      <p className="mt-4">© {new Date().getFullYear()} Lamha</p>
    </footer>
  )
}