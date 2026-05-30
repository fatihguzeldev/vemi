import type { TourBlockStructure } from '../data/types'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { useReducedMotion } from '../hooks/useReducedMotion'

type BlockStackProps = {
  blocks: TourBlockStructure[]
}

export function BlockStack({ blocks }: BlockStackProps) {
  const reduced = useReducedMotion()
  const label = useT(ui.blockStackLabel)

  return (
    <div class="block-stack" role="list" aria-label={label}>
      {blocks.map((block, i) => (
        <div
          role="listitem"
          class={`block-stack__card block-stack__card--${block.kind} ${!reduced ? `animate-fade-in stagger-${i + 1}` : ''}`}
        >
          <span class="block-stack__tag">{block.tag}</span>
          {block.preview && (
            <p
              class={`block-stack__preview ${block.kind === 'heading' ? 'block-stack__preview--heading' : ''}`}
            >
              {block.preview}
            </p>
          )}
          {block.items && (
            <ul class="block-stack__list">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
