import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchPublicConfig } from '../../lib/publicConfig'

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" aria-hidden>
      <path d="M3.6 1.8 13.4 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1z" fill="#2196F3" />
      <path d="M3.6 1.8 16.8 9.1 13.4 12z" fill="#00C853" />
      <path d="M13.4 12l3.4 2.9-13.2 7.3z" fill="#F44336" />
      <path d="M16.8 9.1l3.6 2c.8.4.8 1.4 0 1.8l-3.6 2-3.4-2.9z" fill="#FFC107" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function BadgeLink({
  href,
  icon,
  caption,
  label,
  dark,
}: {
  href: string
  icon: ReactNode
  caption: string
  label: string
  dark: boolean
}) {
  const disabled = !href
  const shell =
    'inline-flex h-12 min-w-[150px] items-center gap-2.5 rounded-xl px-3.5 transition active:scale-[0.98] sm:h-[52px] sm:min-w-[170px] sm:px-4 ' +
    (dark
      ? 'bg-[var(--color-accent)] text-white hover:opacity-95'
      : 'border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-ink)] hover:border-[var(--color-accent)]') +
    (disabled ? ' pointer-events-none opacity-55' : '')

  return (
    <a
      href={href || '#'}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      aria-disabled={disabled}
      className={shell}
      onClick={disabled ? (e) => e.preventDefault() : undefined}
    >
      {icon}
      <span className="flex flex-col items-start leading-none text-start">
        <span className="mb-1 text-[10px] uppercase tracking-wide opacity-90 sm:text-[11px]">{caption}</span>
        <span className="text-[15px] font-semibold whitespace-nowrap sm:text-[17px]">{label}</span>
      </span>
    </a>
  )
}

export default function StoreBadges({ dark = true, className = '' }: { dark?: boolean; className?: string }) {
  const { t } = useTranslation()
  const { data } = useQuery({ queryKey: ['public-config'], queryFn: fetchPublicConfig, staleTime: 60_000 })

  return (
    <div className={`flex flex-wrap items-center gap-3 sm:gap-4 ${className}`}>
      <BadgeLink
        href={data?.play_store_url ?? ''}
        icon={<GooglePlayIcon />}
        caption={t('storeBadges.getItOn')}
        label="Google Play"
        dark={dark}
      />
      <BadgeLink
        href={data?.app_store_url ?? ''}
        icon={<AppleIcon />}
        caption={t('storeBadges.downloadOn')}
        label="App Store"
        dark={dark}
      />
    </div>
  )
}