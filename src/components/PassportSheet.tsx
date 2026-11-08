import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'

// 300 dpi: 1 cm = 118.11 px. Passport / ID photos are 4 × 6 cm.
const PX_PER_CM = 118.11
const PHOTO_W = Math.round(4 * PX_PER_CM) // 472
const PHOTO_H = Math.round(6 * PX_PER_CM) // 709
const GAP = Math.round(0.2 * PX_PER_CM)
const MARGIN = Math.round(0.5 * PX_PER_CM)

const LAYOUTS = [
  { count: 4, cols: 2 },
  { count: 6, cols: 3 },
  { count: 8, cols: 4 },
] as const

/**
 * Tiles one finished 4×6 cm passport/ID photo onto a print sheet at 300 dpi,
 * so the lab can print a whole sheet at once. The editor supplies the already
 * cropped, retouched photo; this only lays it out.
 */
export function PassportSheet({ orderCode }: { orderCode: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [count, setCount] = useState<4 | 6 | 8>(6)

  const layout = LAYOUTS.find((l) => l.count === count)!
  const rows = count / layout.cols
  const width = MARGIN * 2 + layout.cols * PHOTO_W + (layout.cols - 1) * GAP
  const height = MARGIN * 2 + rows * PHOTO_H + (rows - 1) * GAP

  function onFile(file: File | undefined) {
    if (!file) return
    const url = URL.createObjectURL(file)
    const el = new Image()
    el.onload = () => setImg(el)
    el.src = url
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Cover-fit the photo into a 4×6 cell (centre-crop, no distortion).
    const scale = Math.max(PHOTO_W / img.width, PHOTO_H / img.height)
    const sw = PHOTO_W / scale
    const sh = PHOTO_H / scale
    const sx = (img.width - sw) / 2
    const sy = (img.height - sh) / 2
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        const x = MARGIN + c * (PHOTO_W + GAP)
        const y = MARGIN + r * (PHOTO_H + GAP)
        ctx.drawImage(img, sx, sy, sw, sh, x, y, PHOTO_W, PHOTO_H)
      }
    }
  }, [img, count, width, height, rows, layout.cols])

  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `passport-sheet-${orderCode}-x${count}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    }, 'image/png')
  }

  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] p-3">
      <div className="mb-2 text-xs font-semibold text-[var(--color-ink)]">Passport / ID sheet (300 dpi)</div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value) as 4 | 6 | 8)}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
        >
          {LAYOUTS.map((l) => (
            <option key={l.count} value={l.count}>
              {l.count} photos
            </option>
          ))}
        </select>
        <span className="text-[var(--color-muted)]">
          sheet {(width / PX_PER_CM).toFixed(1)} × {(height / PX_PER_CM).toFixed(1)} cm
        </span>
      </div>
      {img && (
        <div className="mt-3">
          <canvas ref={canvasRef} className="w-full rounded border border-[var(--color-border)]" />
          <button
            onClick={download}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            <Download size={14} /> Download sheet (PNG)
          </button>
        </div>
      )}
    </div>
  )
}
