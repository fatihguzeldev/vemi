type HtmlEmitProps = {
  html: string
  compact?: boolean
  formatted?: boolean
}

export function HtmlEmit({ html, compact = false, formatted = false }: HtmlEmitProps) {
  const parts = html.split(/(<[^>]+>)/g).filter(Boolean)

  return (
    <code
      class={`html-emit ${compact ? 'html-emit--compact' : ''} ${formatted ? 'html-emit--formatted' : ''}`}
    >
      {parts.map((part, i) =>
        part.startsWith('<') ? (
          <span key={i} class="html-emit__tag">
            {part}
          </span>
        ) : (
          <span key={i} class="html-emit__text">
            {part}
          </span>
        ),
      )}
    </code>
  )
}
