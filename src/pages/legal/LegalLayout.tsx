import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'

export type Lang = 'en' | 'ar'

/** Public, unauthenticated page shell for legal docs (privacy/terms/refund) —
 * opened straight from the mobile app's Profile screen, so no dashboard chrome,
 * no auth check, just a clean readable page matching the brand. Bilingual:
 * the mobile app can deep-link straight to a language via ?lang=ar, and a
 * toggle lets the reader switch either way. */
export function LegalLayout({
  titleEn,
  titleAr,
  effectiveDateEn,
  effectiveDateAr,
  contentEn,
  contentAr,
}: {
  titleEn: string
  titleAr: string
  effectiveDateEn?: string
  effectiveDateAr?: string
  contentEn: ReactNode
  contentAr: ReactNode
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [lang, setLang] = useState<Lang>(searchParams.get('lang') === 'ar' ? 'ar' : 'en')
  const isAr = lang === 'ar'

  const choose = (l: Lang) => {
    setLang(l)
    setSearchParams(l === 'ar' ? { lang: 'ar' } : {}, { replace: true })
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={'min-h-screen bg-[var(--color-bg)]' + (isAr ? ' font-arabic' : '')}
    >
      <header className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-extrabold tracking-tight text-[var(--color-accent)]">لمحة</span>
            <span className="text-lg font-extrabold tracking-tight text-[var(--color-ink)]">Lamha</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] p-1">
            {(['en', 'ar'] as const).map((l) => (
              <button
                key={l}
                onClick={() => choose(l)}
                className={
                  'rounded-full px-3 py-1 text-xs font-bold uppercase ' +
                  (lang === l
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-muted)]')
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
          {isAr ? titleAr : titleEn}
        </h1>
        {(isAr ? effectiveDateAr : effectiveDateEn) && (
          <p className="mt-1.5 text-sm text-[var(--color-muted)]">
            {isAr ? 'تاريخ السريان: ' : 'Effective date: '}
            {isAr ? effectiveDateAr : effectiveDateEn}
          </p>
        )}
        <div className="legal-content mt-8 text-[15px] leading-relaxed text-[var(--color-ink)]">
          {isAr ? contentAr : contentEn}
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] px-5 py-6 text-center text-xs text-[var(--color-muted)]">
        {isAr ? (
          <>
            © {new Date().getFullYear()} لمحة. عندك سؤال؟ واتساب{' '}
            <a href="https://wa.me/201060270197" className="text-[var(--color-accent)] hover:underline">
              +20 106 027 0197
            </a>
          </>
        ) : (
          <>
            © {new Date().getFullYear()} Lamha. Questions? WhatsApp{' '}
            <a href="https://wa.me/201060270197" className="text-[var(--color-accent)] hover:underline">
              +20 106 027 0197
            </a>
            .
          </>
        )}
      </footer>
    </div>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 mb-2.5 text-lg font-bold text-[var(--color-ink)] first:mt-0">{children}</h2>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-3.5 text-[var(--color-ink)]/90">{children}</p>
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="mb-3.5 list-disc space-y-1.5 ps-5">{children}</ul>
}

export function Muted({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
      {children}
    </div>
  )
}
