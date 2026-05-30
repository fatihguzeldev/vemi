import { pipelineStageLabels } from '../content/ui'
import { useLocale, useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function WelcomeStep() {
  const reduced = useReducedMotion()
  const { locale } = useLocale()
  const tagline = useT(ui.welcomeTagline)
  const stages = pipelineStageLabels[locale]

  return (
    <div class="welcome-step">
      <p class={`welcome-step__tagline ${!reduced ? 'animate-fade-in' : ''}`}>{tagline}</p>
      <div class="welcome-step__pipeline">
        {stages.map((stage, i) => (
          <span
            key={stage}
            class={`welcome-step__stage ${!reduced ? `animate-fade-in stagger-${i + 1}` : ''}`}
          >
            {stage}
            {i < stages.length - 1 && (
              <span class="welcome-step__arrow" aria-hidden="true">
                →
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
