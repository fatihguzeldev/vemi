import { InlineFlow } from '../components/InlineFlow'
import { TokenChip } from '../components/TokenChip'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { tourInlineTokens, tourInlineTree } from '../data/tour'

export function InlineParseStep() {
  const inlineTokensLabel = useT(ui.inlineTokensLabel)
  const inlineNodesLabel = useT(ui.inlineNodesLabel)

  return (
    <div class="inline-parse-step">
      <p class="inline-parse-step__label">{inlineTokensLabel}</p>
      <div class="inline-parse-step__tokens">
        {tourInlineTokens.map((token, i) => (
          <TokenChip key={i} label={token.label} detail={token.text} index={i} />
        ))}
      </div>
      <div class="inline-parse-step__arrow" aria-hidden="true">
        ↓
      </div>
      <p class="inline-parse-step__label">{inlineNodesLabel}</p>
      <InlineFlow nodes={tourInlineTree} />
    </div>
  )
}
