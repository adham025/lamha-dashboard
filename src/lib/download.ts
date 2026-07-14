export type DownloadFormat = 'original' | 'png' | 'jpeg' | 'webp'

function save(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function extFor(type: string) {
  if (type.includes('svg')) return 'svg'
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  return 'jpg'
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = rej
    img.src = url
  })
}

/** Downloads an image, converting to the requested raster format via canvas.
 * "original" saves the stored bytes as-is. Falls back to original on failure. */
export async function downloadImage(url: string, baseName: string, format: DownloadFormat) {
  try {
    if (format === 'original') {
      const blob = await (await fetch(url)).blob()
      return save(blob, `${baseName}.${extFor(blob.type)}`)
    }
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || 600
    canvas.height = img.naturalHeight || 750
    const ctx = canvas.getContext('2d')!
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff' // JPEG has no alpha
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg'
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, mime, 0.95))
    if (!blob) throw new Error('convert-failed')
    save(blob, `${baseName}.${format === 'jpeg' ? 'jpg' : format}`)
  } catch {
    // Fallback: save the original bytes.
    try {
      const blob = await (await fetch(url)).blob()
      save(blob, `${baseName}.${extFor(blob.type)}`)
    } catch {
      /* give up silently */
    }
  }
}
