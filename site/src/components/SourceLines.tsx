import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { useReducedMotion } from '../hooks/useReducedMotion'

type SourceLinesProps = {
  lines: string[]
  highlightLine?: number
  dimOtherLines?: boolean
  animate?: boolean
}

export function SourceLines({
  lines,
  highlightLine,
  dimOtherLines = false,
  animate = true,
}: SourceLinesProps) {
  const reduced = useReducedMotion()
  const label = useT(ui.sourceDocumentLabel)

  return (
    <div class="source-lines" role="img" aria-label={label}>
      {lines.map((line, i) => {
        const lineNum = i + 1
        const isHighlight = highlightLine === lineNum
        const isDimmed = dimOtherLines && highlightLine !== undefined && !isHighlight
        const delay = reduced || !animate ? '' : `stagger-${Math.min(i + 1, 10)}`

        return (
          <div
            key={lineNum}
            class={`source-line ${isHighlight ? 'source-line--highlight' : ''} ${isDimmed ? 'source-line--dimmed' : ''} ${animate && !reduced ? `animate-fade-in ${delay}` : ''}`}
          >
            <span class="source-line__num">{lineNum}</span>
            <code class="source-line__text">{line || ' '}</code>
          </div>
        )
      })}
    </div>
  )
}
