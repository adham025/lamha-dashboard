import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metaForPath } from '../lib/siteMeta'

/** Updates document title/description on public SPA routes (browser + some crawlers). */
export function usePublicPageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = metaForPath(pathname)
    document.title = meta.title

    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.setAttribute('name', 'description')
      document.head.appendChild(desc)
    }
    desc.setAttribute('content', meta.description)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    ogTitle?.setAttribute('content', meta.title)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    ogDesc?.setAttribute('content', meta.description)
    const twTitle = document.querySelector('meta[name="twitter:title"]')
    twTitle?.setAttribute('content', meta.title)
    const twDesc = document.querySelector('meta[name="twitter:description"]')
    twDesc?.setAttribute('content', meta.description)

  }, [pathname])
}