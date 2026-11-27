import type { ReactNode } from 'react'
import Markdown from 'react-markdown'
import { Link } from 'react-router-dom'

export function MarkdownBody({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <ProseWrap className={className}>
      <Markdown
        components={{
          h2: ({ children }) => (
            <h2 className="mb-4 mt-10 text-xl font-semibold text-[var(--color-ink)] first:mt-0 sm:text-2xl">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-lg font-semibold text-[var(--color-ink)]">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-[15px] leading-relaxed text-[var(--color-ink)]/90">{children}</p>
          ),
          ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 ps-6 text-[15px]">{children}</ol>,
          ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 ps-6 text-[15px]">{children}</ul>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-[var(--color-ink)]">{children}</strong>,
          blockquote: ({ children }) => (
            <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--color-muted)]">
              {children}
            </div>
          ),
          a: ({ href, children }) => {
            const cls = 'font-medium text-[var(--color-accent)] underline-offset-2 hover:underline'
            if (href?.startsWith('/')) {
              return (
                <Link to={href} className={cls}>
                  {children}
                </Link>
              )
            }
            return (
              <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          },
        }}
      >
        {markdown}
      </Markdown>
    </ProseWrap>
  )
}

function ProseWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={'max-w-none break-words ' + (className ?? '')}>
      {children}
    </div>
  )
}