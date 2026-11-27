import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MarkdownBody } from '../../components/MarkdownBody'
import InnerPageShell from '../../components/landing/InnerPageShell'
import StoreBadges from '../../components/landing/StoreBadges'
import { useLanguage } from '../../hooks/useLanguage'
import { fetchPublicCmsPage } from '../../lib/cms'
import { ICON_STROKE } from '../../lib/icons'
import { prepareCmsMarkdown } from '../../lib/markdownPlaceholders'
import { fetchPublicConfig } from '../../lib/publicConfig'

export default function ContactPage() {
  const { t } = useTranslation()
  const { isArabic } = useLanguage()
  const cms = useQuery({ queryKey: ['cms-public', 'contact'], queryFn: () => fetchPublicCmsPage('contact') })
  const cfg = useQuery({ queryKey: ['public-config'], queryFn: fetchPublicConfig, staleTime: 0 })

  const title = cms.data ? (isArabic ? cms.data.title_ar : cms.data.title_en) : t('contact.title')
  const body = cms.data
    ? prepareCmsMarkdown(isArabic ? cms.data.body_ar : cms.data.body_en, cfg.data ?? {}, { isArabic })
    : ''

  const email = cfg.data?.support_email?.trim() ?? ''
  const waDisplay = cfg.data?.support_whatsapp?.trim() ?? ''
  const waDigits = waDisplay.replace(/\D/g, '')

  return (
    <InnerPageShell title={title} meta={<span>{t('contact.subtitle')}</span>}>
      {(waDisplay || email) && (
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {waDisplay ? (
            <ContactCard
              icon={<MessageCircle size={28} strokeWidth={ICON_STROKE} className="text-[var(--color-accent)]" />}
              label={t('contact.whatsapp')}
              href={waDigits ? `https://wa.me/${waDigits}` : '#'}
              value={waDisplay}
            />
          ) : null}
          {email ? (
            <ContactCard
              icon={<Mail size={28} strokeWidth={ICON_STROKE} className="text-[var(--color-accent)]" />}
              label={t('contact.email')}
              href={`mailto:${email}`}
              value={email}
            />
          ) : null}
        </div>
      )}
      {body ? (
        <div className="border-t border-[var(--color-border)] pt-8">
          <MarkdownBody markdown={body} className={isArabic ? 'font-arabic' : ''} />
        </div>
      ) : null}
      <div className="mt-12 border-t border-[var(--color-border)] pt-10 text-center">
        <p className="mb-4 text-sm font-semibold text-[var(--color-muted)]">{t('download.label')}</p>
        <StoreBadges className="justify-center" dark={false} />
      </div>
    </InnerPageShell>
  )
}

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode
  label: string
  value: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center transition hover:border-[var(--color-accent)] sm:p-8"
    >
      {icon}
      <span className="mt-3 text-sm text-[var(--color-muted)]">{label}</span>
      <span className="mt-2 text-base font-bold text-[var(--color-ink)] break-all">{value}</span>
    </a>
  )
}