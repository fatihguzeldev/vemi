import { useLayoutEffect, useRef, useState } from 'preact/hooks'
import { useLocale, useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import type { Locale } from '../data/types'

type IndicatorRect = {
  x: number
  width: number
}

export function LocaleToggle() {
  const { locale, setLocale } = useLocale()
  const languageLabel = useT(ui.languageToggle)
  const groupRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<IndicatorRect>({ x: 0, width: 0 })
  const [animate, setAnimate] = useState(false)

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return

    const measure = () => {
      const active = group.querySelector<HTMLButtonElement>(`[data-locale="${locale}"]`)
      if (!active) return
      setIndicator({ x: active.offsetLeft, width: active.offsetWidth })
    }

    measure()
    requestAnimationFrame(() => setAnimate(true))

    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [locale])

  const switchLocale = (next: Locale) => {
    if (next !== locale) setLocale(next)
  }

  return (
    <div ref={groupRef} class="header__toggle-group" role="group" aria-label={languageLabel}>
      <span
        class={`header__toggle-indicator ${animate ? 'header__toggle-indicator--animate' : ''}`}
        aria-hidden="true"
        style={{
          width: `${indicator.width}px`,
          transform: `translate3d(${indicator.x}px, 0, 0)`,
        }}
      />
      <button
        type="button"
        data-locale="en"
        class={`header__toggle ${locale === 'en' ? 'header__toggle--active' : ''}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => switchLocale('en')}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        data-locale="tr"
        class={`header__toggle ${locale === 'tr' ? 'header__toggle--active' : ''}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => switchLocale('tr')}
        aria-pressed={locale === 'tr'}
      >
        TR
      </button>
    </div>
  )
}
