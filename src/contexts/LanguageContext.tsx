import { createContext, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export type LanguageContextType = {
  currentLanguage: string
  switchLanguage: () => void
  isArabic: boolean
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language.split('-')[0] ?? 'en')
  const isArabic = currentLanguage === 'ar'

  const switchLanguage = () => {
    const next = isArabic ? 'en' : 'ar'
    void i18n.changeLanguage(next)
  }

  useEffect(() => {
    const apply = (lng: string) => {
      const base = lng.split('-')[0] ?? 'en'
      setCurrentLanguage(base)
      const html = document.documentElement
      html.setAttribute('lang', base)
      html.setAttribute('dir', base === 'ar' ? 'rtl' : 'ltr')
    }
    i18n.on('languageChanged', apply)
    apply(i18n.language)
    return () => {
      i18n.off('languageChanged', apply)
    }
  }, [i18n])

  return (
    <LanguageContext.Provider value={{ currentLanguage, switchLanguage, isArabic }}>
      {children}
    </LanguageContext.Provider>
  )
}