import { useReducedMotion } from '../hooks/useReducedMotion'

type TokenChipProps = {
  label: string
  detail?: string
  active?: boolean
  index?: number
  animate?: boolean
  animationDelayMs?: number
}

export function TokenChip({
  label,
  detail,
  active = false,
  index = 0,
  animate = true,
  animationDelayMs,
}: TokenChipProps) {
  const reduced = useReducedMotion()
  const staggerClass =
    reduced || !animate || animationDelayMs !== undefined ? '' : `stagger-${Math.min(index + 1, 10)}`
  const style =
    animationDelayMs !== undefined && animate && !reduced
      ? { animationDelay: `${animationDelayMs}ms` }
      : undefined

  return (
    <div
      class={`token-chip ${active ? 'token-chip--active' : ''} ${animate && !reduced ? `animate-lift-in ${staggerClass}` : ''}`}
      style={style}
    >
      <span class="token-chip__label">{label}</span>
      {detail && <span class="token-chip__detail">{detail}</span>}
    </div>
  )
}
