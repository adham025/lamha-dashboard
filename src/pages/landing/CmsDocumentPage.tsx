import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { MarkdownBody } from '../../components/MarkdownBody'
import ContactUsDetails from '../../components/landing/ContactUsDetails'
import InnerPageShell from '../../components/landing/InnerPageShell'
import StoreBadges from '../../components/landing/StoreBadges'
import { useLanguage } from '../../hooks/useLanguage'
import { fetchPublicCmsPage } from '../../lib/cms'
import { resolveCmsEffectiveDate } from '../../lib/cmsEffectiveDate'
import { prepareCmsMarkdown } from '../../lib/markdownPlaceholders'
import { fetchPublicConfig } from '../../lib/publicConfig'

const LEGAL_SLUGS = new Set(['privacy', 'terms', 'refund'])

export default function CmsDocumentPage({ slug: slugProp }: { slug?: string }) {
  const params = useParams()
  const slug = slugProp ?? params.slug ?? ''
  const { isArabic } = useLanguage()
  const { t } = useTranslation()

  const { data, isLoading, error } = useQuery({
    queryKey: ['cms-public', slug],
    queryFn: () => fetchPublicCmsPage(slug),
    enabled: !!slug,
  })
  const cfg = useQuery({ queryKey: ['public-config'], queryFn: fetchPublicConfig, staleTime: 0 })

  if (!slug) return <Centered>{t('nav.home')}</Centered>
  if (isLoading) return <Centered>…</Centered>
  if (error || !data) return <Centered>Page not found.</Centered>

  const title = isArabic ? data.title_ar : data.title_en
  const rawBody = isArabic ? data.body_ar : data.body_en
  const body = prepareCmsMarkdown(rawBody, cfg.data ?? {}, { isArabic })
  const isLegal = LEGAL_SLUGS.has(slug)

  const meta =
    isLegal ? (
      <span>
        {isArabic ? 'تاريخ السريان: ' : 'Last updated: '}
        {resolveCmsEffectiveDate(data.effective_date, isArabic)}
      </span>
    ) : slug === 'about' ? (
      <span>{t('about.subtitle')}</span>
    ) : undefined

  return (
    <InnerPageShell
      title={title}
      meta={meta}
      footer={
        isLegal ? (
          <div className="pb-12 text-center">
            <p className="mb-3 text-sm text-[var(--color-muted)]">{t('download.label')}</p>
            <StoreBadges className="justify-center" dark={false} />
          </div>
        ) : undefined
      }
    >
      {slug === 'about' ? (
        <img
          src="/landing/showcase.jpg"
          alt=""
          className="mb-8 w-full rounded-xl object-cover shadow-sm"
          loading="lazy"
        />
      ) : null}
      <MarkdownBody markdown={body} className={isArabic ? 'font-arabic' : ''} />
      {(isLegal || slug === 'about') && <ContactUsDetails />}
    </InnerPageShell>
  )
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-[var(--color-muted)] sm:px-6">
      {children}
    </div>
  )
}