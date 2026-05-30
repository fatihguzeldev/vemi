import type { ComponentChildren } from 'preact'

type StageProps = {
  children: ComponentChildren
  stepKey: string
}

export function Stage({ children, stepKey }: StageProps) {
  return (
    <div class="stage" key={stepKey} role="region" aria-live="polite">
      <div class="stage__inner">{children}</div>
    </div>
  )
}
