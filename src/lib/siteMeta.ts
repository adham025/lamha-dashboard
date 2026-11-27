/** Public marketing site — titles/descriptions for SEO and in-app document updates. */
export const SITE_NAME = 'Lamha'
export const SITE_TAGLINE = 'Photo editing & print, delivered in Egypt'

export const DEFAULT_DESCRIPTION =
  'Lamha is a photo service in Egypt: restore prints, passport photos, portrait retouching, and doorstep print delivery. Human editors, Arabic and English, clear InstaPay pricing.'

export const PUBLIC_PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  '/about': {
    title: `About ${SITE_NAME}`,
    description: 'How Lamha works: human photo editing, customer review before print, and delivery across Egypt.',
  },
  '/contact': {
    title: `Contact ${SITE_NAME}`,
    description: 'Reach Lamha on WhatsApp or email for order help, passport sizes, or studio partnerships in Egypt.',
  },
  '/legal/privacy': {
    title: `${SITE_NAME} — Privacy Policy`,
    description: 'How Lamha collects and uses personal data for photo editing and print orders in Egypt (PDPL-aligned).',
  },
  '/legal/terms': {
    title: `${SITE_NAME} — Terms of Service`,
    description: 'Terms for using the Lamha app and ordering professional photo editing and print delivery in Egypt.',
  },
  '/legal/refund': {
    title: `${SITE_NAME} — Refund & Cancellation`,
    description: 'Refund and cancellation rules for Lamha print and editing orders in Egypt.',
  },
}

export function metaForPath(pathname: string) {
  return PUBLIC_PAGE_META[pathname] ?? PUBLIC_PAGE_META['/']
}