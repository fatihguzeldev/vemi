import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'

type PseudoCodeProps = {
  code: { en: string; tr: string }
}

export function PseudoCode({ code }: PseudoCodeProps) {
  const text = useT(code)
  const label = useT(ui.pseudoCodeLabel)

  return (
    <div class="pseudo-code animate-fade-in stagger-3">
      <div class="pseudo-code__label">{label}</div>
      <pre class="pseudo-code__block">
        <code>{text}</code>
      </pre>
    </div>
  )
}
