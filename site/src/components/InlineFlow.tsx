import type { TourInlineNode } from '../data/types'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { useReducedMotion } from '../hooks/useReducedMotion'

type InlineFlowProps = {
  nodes: TourInlineNode[]
}

function segmentText(node: TourInlineNode): string {
  if (node.text) return node.text
  const child = node.children?.[0]
  if (child?.text) return child.text
  return ''
}

export function InlineFlow({ nodes }: InlineFlowProps) {
  const reduced = useReducedMotion()
  const label = useT(ui.inlineFlowLabel)

  return (
    <div class="inline-flow" role="list" aria-label={label}>
      <div class="inline-flow__line">
        {nodes.map((node, i) => {
          const text = segmentText(node)
          const isWrapper = node.type !== 'text'

          return (
            <span
              role="listitem"
              class={`inline-flow__segment ${isWrapper ? `inline-flow__segment--${node.type}` : 'inline-flow__segment--text'} ${!reduced ? `animate-fade-in stagger-${Math.min(i + 1, 10)}` : ''}`}
            >
              <span class="inline-flow__tag">{node.label}</span>
              <span
                class={`inline-flow__content ${isWrapper ? `inline-flow__content--${node.type}` : ''}`}
              >
                {text}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
