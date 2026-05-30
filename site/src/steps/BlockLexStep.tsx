import { SourceLines } from '../components/SourceLines'
import { TokenChip } from '../components/TokenChip'
import { tourBlockTokens, tourSourceLines } from '../data/tour'

export function BlockLexStep() {
  return (
    <div class="block-lex-step">
      <SourceLines lines={tourSourceLines} animate />
      <div class="block-lex-step__tokens">
        {tourBlockTokens.map((token, i) => (
          <TokenChip
            key={`${token.line}-${token.type}`}
            label={token.label}
            detail={token.text ?? (token.level ? `h${token.level}` : undefined)}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
