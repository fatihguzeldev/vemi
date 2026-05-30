import { TokenChip } from '../components/TokenChip'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { tourInlineTokens } from '../data/tour'
import { useReducedMotion } from '../hooks/useReducedMotion'

const SEGMENT_STAGGER_MS = 120
const SEGMENT_DURATION_MS = 400

export function InlineLexStep() {
  const reduced = useReducedMotion()
  const sourceLineLabel = useT(ui.inlineSourceLineLabel)
  const inlineTokensLabel = useT(ui.inlineTokensLabel)

  return (
    <div class="inline-lex-step">
      <p class="inline-lex-step__label">{sourceLineLabel}</p>
      <div class="inline-lex-step__source">
        <code class="inline-lex-step__line">
          {tourInlineTokens.map((token, i) => (
            <span
              key={i}
              class={`inline-lex-step__segment ${token.type === 'delimiterRun' ? 'inline-lex-step__segment--delimiter' : ''} ${!reduced ? 'animate-inline-segment' : 'inline-lex-step__segment--lit'}`}
              style={!reduced ? { animationDelay: `${i * SEGMENT_STAGGER_MS}ms` } : undefined}
            >{token.text}</span>
          ))}
        </code>
      </div>
      <p class="inline-lex-step__label">{inlineTokensLabel}</p>
      <div class="inline-lex-step__tokens">
        {tourInlineTokens.map((token, i) => (
          <TokenChip
            key={i}
            label={token.label}
            detail={token.text}
            active={token.type === 'delimiterRun'}
            index={i}
            animate={!reduced}
            animationDelayMs={!reduced ? i * SEGMENT_STAGGER_MS + SEGMENT_DURATION_MS * 0.6 : undefined}
          />
        ))}
      </div>
    </div>
  )
}
