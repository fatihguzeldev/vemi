import { createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'
import type { Locale } from '../data/types'

const STORAGE_KEY = 'vemi-locale'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
})

export function LocaleProvider({ children }: { children: preact.ComponentChildren }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'tr' ? 'tr' : 'en'
  })

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function useT<T extends Record<Locale, string>>(record: T): string {
  const { locale } = useLocale()
  return record[locale]
}
