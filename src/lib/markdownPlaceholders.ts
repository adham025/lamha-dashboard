import { CMS_EFFECTIVE_DATE_AR, CMS_EFFECTIVE_DATE_EN } from './cmsEffectiveDate'
import type { PublicConfig } from './publicConfig'

export type PrepareCmsOptions = {
  isArabic?: boolean
}

const LEGAL_LINK_FIXES: [RegExp, string][] = [
  [/\[([^\]]+)\]\(PRIVACY_POLICY\.md\)/gi, '[$1](/legal/privacy)'],
  [/\[([^\]]+)\]\(REFUND_AND_CANCELLATION\.md\)/gi, '[$1](/legal/refund)'],
  [/\[([^\]]+)\]\(TERMS_OF_SERVICE\.md\)/gi, '[$1](/legal/terms)'],
]

const CONTACT_SECTION_TAIL = [
  /\n## \d+\. Contact\n[\s\S]*$/i,
  /\n## \d+\.[^\n]*\bContact\b[^\n]*\n[\s\S]*$/i,
  /\n## \d+\.[^\n]*التواصل[^\n]*\n[\s\S]*$/u,
  /\n## \d+\. How to request\n[\s\S]*$/i,
  /\n## \d+\.[^\n]*طلب[^\n]*\n[\s\S]*$/u,
]

/** Resolve dashboard placeholders, fix links, and drop duplicate legal footers. */
export function prepareCmsMarkdown(
  markdown: string,
  cfg: Partial<PublicConfig>,
  opts?: PrepareCmsOptions,
): string {
  let out = markdown
  const dateEn = CMS_EFFECTIVE_DATE_EN
  const dateAr = CMS_EFFECTIVE_DATE_AR
  const email = cfg.support_email?.trim() ?? ''
  const wa = cfg.support_whatsapp?.trim() ?? ''

  for (const [re, rep] of LEGAL_LINK_FIXES) out = out.replace(re, rep)

  for (const re of CONTACT_SECTION_TAIL) out = out.replace(re, '')

  out = out
    .replace(/^\*\*Contact:\*\*[^\n]*\n\n?/gm, '')
    .replace(/\n\*\*Contact:\*\*[^\n]*\n/g, '\n')
    .replace(/[·•]\s*\[YOUR FULL LEGAL NAME\][^\n]*/g, '')
    .replace(/\[REGISTERED ADDRESS\][^\n]*/g, '')

  const emailToken = email || '{{support_email}}'
  const waToken = wa || '{{support_whatsapp}}'

  out = out
    .replace(/\{\{support_email\}\}/g, emailToken)
    .replace(/\{\{support_whatsapp\}\}/g, waToken)
    .replace(/\[SUPPORT EMAIL\]/g, emailToken)
    .replace(/\[البريد الإلكتروني للدعم\]/g, emailToken)

  if (email) {
    out = out.replace(/adhamg\d*@gmail\.com/gi, email)
  }
  if (wa) {
    out = out.replace(/\+20\s*106\s*027\s*0197/g, wa)
  }

  out = out
    .replace(/\[EFFECTIVE DATE\]/g, opts?.isArabic ? dateAr : dateEn)
    .replace(/\[تاريخ السريان\]/g, dateAr)

  return out.trim()
}