import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** A right-side slide-in panel used for add/edit forms across the dashboard. */
export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={'fixed inset-0 z-50 ' + (open ? '' : 'pointer-events-none')}>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={
          'absolute inset-0 bg-black/30 transition-opacity duration-200 ' +
          (open ? 'opacity-100' : 'opacity-0')
        }
      />
      {/* Panel */}
      <aside
        className={
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[var(--color-panel)] shadow-xl transition-transform duration-200 ' +
          (open ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="border-t border-[var(--color-border)] px-5 py-4">{footer}</div>
        )}
      </aside>
    </div>
  )
}
