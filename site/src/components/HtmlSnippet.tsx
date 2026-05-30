import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'

type HtmlSnippetProps = {
  html: string
  animate?: boolean
}

export function HtmlSnippet({ html, animate = true }: HtmlSnippetProps) {
  const label = useT(ui.htmlSnippetLabel)

  return (
    <pre
      class={`html-snippet ${animate ? 'animate-fade-in-only' : ''}`}
      aria-label={label}
    >
      <code>{html}</code>
    </pre>
  )
}
