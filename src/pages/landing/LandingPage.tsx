import {
  Briefcase,
  Heart,
  ImageUp,
  ShieldCheck,
  Smile,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import FaqSection from '../../components/landing/FaqSection'
import StoreBadges from '../../components/landing/StoreBadges'
import { ICON_STROKE } from '../../lib/icons'

type CardKey = 'restore' | 'passport' | 'retouch' | 'cartoon' | 'headshot' | 'wedding'
const cardKeys: CardKey[] = ['restore', 'passport', 'retouch', 'cartoon', 'headshot', 'wedding']
const cardIcons: LucideIcon[] = [ImageUp, ShieldCheck, Sparkles, Smile, Briefcase, Heart]

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <HeroCopy t={t} />
          <div className="relative">
            <img
              src="/landing/hero.jpg"
              width={1400}
              height={933}
              alt=""
              className="aspect-[4/3] w-full rounded-3xl border border-[var(--color-border)] object-cover shadow-lg"
              fetchPriority="high"
              decoding="async"
            />
            <img
              src="/landing/portrait.jpg"
              width={320}
              height={320}
              alt=""
              className="absolute -bottom-6 -left-4 hidden w-36 rounded-2xl border-4 border-[var(--color-panel)] object-cover shadow-md sm:block lg:-left-8 lg:w-44"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section id="services" className="border-t border-[var(--color-border)] bg-[var(--color-panel)] py-16">
        <ServicesSection t={t} cardKeys={cardKeys} cardIcons={cardIcons} />
      </section>

      <FaqSection />

      <section id="download" className="mx-auto max-w-6xl px-5 py-16 text-center">
        <h2 className="text-2xl font-bold">{t('download.title')}</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{t('download.body')}</p>
        <div className="mt-8 flex justify-center">
          <StoreBadges className="justify-center" />
        </div>
      </section>
    </main>
  )
}

function HeroCopy({ t }: { t: (k: string) => string }) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">{t('hero.kicker')}</p>
      <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.65rem]">
        {t('hero.title')}
        <br />
        <span className="text-[var(--color-accent)]">{t('hero.titleAccent')}</span>
      </h1>
      <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[var(--color-muted)]">{t('hero.body')}</p>
      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">{t('download.label')}</p>
        <StoreBadges />
      </div>
    </div>
  )
}

function ServicesSection({
  t,
  cardKeys,
  cardIcons,
}: {
  t: (key: string) => string
  cardKeys: CardKey[]
  cardIcons: LucideIcon[]
}) {
  return (
    <>
      <div className="mx-auto max-w-6xl px-5 text-center">
        <h2 className="text-2xl font-bold">{t('services.title')}</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{t('services.subtitle')}</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-6xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {cardKeys.map((key, i) => {
          const Icon = cardIcons[i]!
          return (
            <div
              key={key}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-start shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Icon size={22} strokeWidth={ICON_STROKE} />
              </div>
              <div className="mt-3 font-bold">{t(`cards.${key}.title`)}</div>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{t(`cards.${key}.blurb`)}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}