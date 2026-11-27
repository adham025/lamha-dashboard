export const CMS_EFFECTIVE_DATE_EN = '1 December 2026'
export const CMS_EFFECTIVE_DATE_AR = '1 ديسمبر 2026'

export function resolveCmsEffectiveDate(raw: string | null | undefined, isArabic: boolean): string {
  const v = raw?.trim()
  if (v && v !== '[EFFECTIVE DATE]' && v !== '[تاريخ السريان]') return v
  return isArabic ? CMS_EFFECTIVE_DATE_AR : CMS_EFFECTIVE_DATE_EN
}