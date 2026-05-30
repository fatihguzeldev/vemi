import { pipelineStageLabels, ui } from '../content/ui'
import { useLocale, useT } from '../context/LocaleContext'
import { useReducedMotion } from '../hooks/useReducedMotion'

const NODE_STAGGER_MS = 90
const NODE_DURATION_MS = 550
const RAIL_PAUSE_MS = 120
const RAIL_DURATION_MS = 650

export function PipelineStep() {
  const reduced = useReducedMotion()
  const { locale } = useLocale()
  const pipelineAriaLabel = useT(ui.pipelineAriaLabel)
  const stages = pipelineStageLabels[locale]
  const railDelayMs =
    (stages.length - 1) * NODE_STAGGER_MS + NODE_DURATION_MS + RAIL_PAUSE_MS

  return (
    <div class="pipeline-step">
      <div
        class="pipeline-step__track"
        style={{
          '--pipeline-count': stages.length,
          '--pipeline-rail-delay': `${railDelayMs}ms`,
          '--pipeline-rail-duration': `${RAIL_DURATION_MS}ms`,
          '--pipeline-node-duration': `${NODE_DURATION_MS}ms`,
        }}
        role="img"
        aria-label={pipelineAriaLabel}
      >
        <div
          class={`pipeline-step__rail ${!reduced ? 'animate-pipeline-rail' : ''}`}
          aria-hidden="true"
        />
        {stages.map((stage, i) => {
          const delayMs = (i + 1) * NODE_STAGGER_MS
          const motionStyle = !reduced ? { animationDelay: `${delayMs}ms` } : undefined

          return (
            <div key={stage} class="pipeline-step__cell">
              <div
                class={`pipeline-step__dot ${!reduced ? 'animate-pipeline-node' : ''}`}
                style={motionStyle}
              />
              <span
                class={`pipeline-step__label ${!reduced ? 'animate-fade-in-only' : ''}`}
                style={motionStyle}
              >
                {stage}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
