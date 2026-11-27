import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../hooks/useLanguage'
import { fetchPublicFaq } from '../../lib/faq'
import { ICON_STROKE } from '../../lib/icons'
import SectionHeading from './SectionHeading'

function FaqItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <article className="border-b border-[var(--color-border)] pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-2 text-start"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[var(--color-ink)] md:text-lg">{question}</span>
        <ChevronDown
          size={22}
          strokeWidth={ICON_STROKE}
          className={'shrink-0 text-[var(--color-accent)] transition-transform ' + (open ? 'rotate-180' : '')}
        />
      </button>
      {open ? <p className="pt-1 text-sm leading-relaxed text-[var(--color-muted)]">{answer}</p> : null}
    </article>
  )
}

export default function FaqSection() {
  const { t } = useTranslation()
  const { isArabic } = useLanguage()
  const { data = [] } = useQuery({ queryKey: ['public-faq'], queryFn: fetchPublicFaq })

  if (!data.length) return null

  return (
    <section id="faq" className="border-t border-[var(--color-border)] bg-[var(--color-panel)] py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2 lg:gap-16">
        <SectionHeading eyebrow={t('faq.kicker')} title={t('faq.title')} description={t('faq.subtitle')} />
        <div className="flex flex-col gap-4">
          {data.map((item, index) => (
            <FaqItem
              key={item.id}
              question={isArabic ? item.question_ar : item.question_en}
              answer={isArabic ? item.answer_ar : item.answer_en}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}