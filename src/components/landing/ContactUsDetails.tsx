import { useQuery } from '@tanstack/react-query'
import { Mail, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ICON_STROKE } from '../../lib/icons'
import { fetchPublicConfig } from '../../lib/publicConfig'

export default function ContactUsDetails() {
  const { t } = useTranslation()
  const { data } = useQuery({
    queryKey: ['public-config'],
    queryFn: fetchPublicConfig,
    staleTime: 0,
  })
  const email = data?.support_email?.trim() ?? ''
  const waDisplay = data?.support_whatsapp?.trim() ?? ''
  const waDigits = waDisplay.replace(/\D/g, '')
  const row = 'flex flex-wrap items-center gap-2 text-[15px] text-[var(--color-ink)]'
  const icon = 'shrink-0 text-[var(--color-accent)]'

  return (
    <section className="mt-10 border-t border-[var(--color-border)] pt-8">
      <h2 className="mb-4 text-lg font-bold text-[var(--color-ink)]">{t('contact.title')}</h2>
      <div className="space-y-3">
        {waDisplay ? (
          <div className={row}>
            <MessageCircle size={20} strokeWidth={ICON_STROKE} className={icon} />
            <a
              href={waDigits ? `https://wa.me/${waDigits}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-[var(--color-accent)] hover:underline"
              dir="ltr"
            >
              {waDisplay}
            </a>
          </div>
        ) : null}
        {email ? (
          <div className={row}>
            <Mail size={20} strokeWidth={ICON_STROKE} className={icon} />
            <a href={`mailto:${email}`} className="font-medium hover:text-[var(--color-accent)] hover:underline">
              {email}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  )
}