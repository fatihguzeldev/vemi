import { BlockStack } from '../components/BlockStack'
import { TokenChip } from '../components/TokenChip'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { tourBlockStructure, tourBlockTokens } from '../data/tour'

export function BlockParseStep() {
  const blockTokensLabel = useT(ui.blockTokensLabel)
  const blockStructureLabel = useT(ui.blockStructureLabel)

  return (
    <div class="block-parse-step">
      <p class="block-parse-step__label">{blockTokensLabel}</p>
      <div class="block-parse-step__tokens">
        {tourBlockTokens.map((token, i) => (
          <TokenChip
            key={`${token.line}-${token.type}`}
            label={token.label}
            detail={token.text?.slice(0, 24)}
            index={i}
          />
        ))}
      </div>
      <div class="block-parse-step__arrow" aria-hidden="true">
        ↓
      </div>
      <p class="block-parse-step__label">{blockStructureLabel}</p>
      <BlockStack blocks={tourBlockStructure} />
    </div>
  )
}
