import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function publicSiteUrl(): string {
  const fromEnv = process.env.VITE_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '')}`
  return 'https://lamha-zeta.vercel.app'
}

const PUBLIC_PATHS = ['/', '/about', '/contact', '/legal/privacy', '/legal/terms', '/legal/refund'] as const

function lamhaSeoPlugin(): Plugin {
  const siteUrl = () => publicSiteUrl()

  return {
    name: 'lamha-seo',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl())
    },
    closeBundle() {
      const url = siteUrl()
      const out = path.resolve(__dirname, 'dist')

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_PATHS.map(
  (p) => `  <url><loc>${p === '/' ? `${url}/` : `${url}${p}`}</loc><changefreq>weekly</changefreq></url>`,
).join('\n')}
</urlset>
`
      fs.mkdirSync(out, { recursive: true })
      fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap, 'utf8')

      const robots = `User-agent: *
Allow: /
Disallow: /today
Disallow: /payments
Disallow: /editing
Disallow: /print
Disallow: /orders
Disallow: /users
Disallow: /settings
Disallow: /roles
Disallow: /reports
Disallow: /site
Disallow: /catalogue

Sitemap: ${url}/sitemap.xml
`
      fs.writeFileSync(path.join(out, 'robots.txt'), robots, 'utf8')

      const llmsSrc = fs.readFileSync(path.join(__dirname, 'public', 'llms.txt'), 'utf8')
      fs.writeFileSync(path.join(out, 'llms.txt'), llmsSrc.replaceAll('%SITE_URL%', url), 'utf8')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), lamhaSeoPlugin()],
})