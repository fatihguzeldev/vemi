import { useLocale, useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import type { StepContent } from '../content/steps'

type StepMetaProps = {
  step: StepContent
  stepNumber: number
  totalSteps: number
}

export function StepMeta({ step, stepNumber, totalSteps }: StepMetaProps) {
  const { locale } = useLocale()
  const title = useT(step.title)
  const body = useT(step.body)
  const stepLabel = ui.stepCounter[locale]

  return (
    <div class="step-meta" aria-live="polite" aria-atomic="true">
      <p class="step-meta__counter">
        {stepLabel} {String(stepNumber).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
      </p>
      <h1 class="step-meta__title">{title}</h1>
      <p class="step-meta__body">{body}</p>
    </div>
  )
}
