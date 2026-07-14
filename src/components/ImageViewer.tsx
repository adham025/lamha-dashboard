import { useState } from 'react'
import { Download } from 'lucide-react'
import Drawer from './Drawer'
import { downloadImage, type DownloadFormat } from '../lib/download'

export type ViewerImage = { label?: string; url: string }

const FORMATS: { v: DownloadFormat; l: string }[] = [
  { v: 'png', l: 'PNG' },
  { v: 'jpeg', l: 'JPG' },
  { v: 'webp', l: 'WebP' },
  { v: 'original', l: 'Original' },
]

export function ImageViewer({
  open,
  onClose,
  title,
  baseName,
  images,
  loading,
}: {
  open: boolean
  onClose: () => void
  title: string
  baseName: string
  images: ViewerImage[]
  loading?: boolean
}) {
  const [fmt, setFmt] = useState<DownloadFormat>('png')

  return (
    <Drawer open={open} onClose={onClose} title={title}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-sm text-[var(--color-muted)]">
          {images.length > 1 ? `${images.length} images` : '1 image'}
        </span>
        <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          Download as
          <select
            value={fmt}
            onChange={(e) => setFmt(e.target.value as DownloadFormat)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm text-[var(--color-ink)]"
          >
            {FORMATS.map((f) => (
              <option key={f.v} value={f.v}>{f.l}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]">Loading…</p>}
      {!loading && images.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">No images for this record.</p>
      )}

      <div className="space-y-5">
        {images.map((im, i) => (
          <div key={i}>
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
              <img src={im.url} alt={im.label ?? `Image ${i + 1}`} className="w-full" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted)]">{im.label ?? `Image ${i + 1}`}</span>
              <button
                onClick={() => downloadImage(im.url, `${baseName}-${i + 1}`, fmt)}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  )
}
