import { ChevronLeft, ChevronRight } from 'lucide-preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { PseudoCode } from './PseudoCode'
import { Stage } from './Stage'
import { StepMeta } from './StepMeta'
import { getStep, steps, type StepId } from '../content/steps'
import { useLocale, useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { AstStep } from '../steps/AstStep'
import { BlockLexStep } from '../steps/BlockLexStep'
import { BlockParseStep } from '../steps/BlockParseStep'
import { CodegenStep } from '../steps/CodegenStep'
import { InlineLexStep } from '../steps/InlineLexStep'
import { InlineParseStep } from '../steps/InlineParseStep'
import { OutputStep } from '../steps/OutputStep'
import { PipelineStep } from '../steps/PipelineStep'
import { SourceStep } from '../steps/SourceStep'
import { TwoLayersStep } from '../steps/TwoLayersStep'
import { WelcomeStep } from '../steps/WelcomeStep'

const stepComponents: Record<StepId, () => preact.JSX.Element> = {
  welcome: WelcomeStep,
  source: SourceStep,
  pipeline: PipelineStep,
  'block-lex': BlockLexStep,
  'block-parse': BlockParseStep,
  'two-layers': TwoLayersStep,
  'inline-lex': InlineLexStep,
  'inline-parse': InlineParseStep,
  ast: AstStep,
  codegen: CodegenStep,
  output: OutputStep,
}

function parseHash(): number {
  const hash = window.location.hash.replace('#', '')
  const idx = steps.findIndex((s) => s.id === hash)
  return idx >= 0 ? idx : 0
}

export function StepSlider() {
  const [currentIndex, setCurrentIndex] = useState(parseHash)
  const [animKey, setAnimKey] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const { locale } = useLocale()
  const navLabel = useT(ui.navLabel)
  const navPrevious = useT(ui.navPrevious)
  const navNext = useT(ui.navNext)
  const navStepsList = useT(ui.navStepsList)
  const stepCounter = ui.stepCounter[locale]

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, index))
    setCurrentIndex(clamped)
    setAnimKey((k) => k + 1)
    const id = steps[clamped]?.id
    if (id) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }, [])

  const goPrev = () => goTo(currentIndex - 1)
  const goNext = () => goTo(currentIndex + 1)

  useEffect(() => {
    const onHashChange = () => goTo(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [goTo])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

      const target = e.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }

      e.preventDefault()

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }

      if (e.key === 'ArrowLeft') goTo(currentIndex - 1)
      else goTo(currentIndex + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentIndex, goTo])

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const diff = endX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goPrev()
      else goNext()
    }
    touchStartX.current = null
  }

  const step = getStep(steps[currentIndex]!.id)
  const StepVisual = stepComponents[step.id]

  return (
    <div
      class="step-slider"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <StepMeta step={step} stepNumber={currentIndex + 1} totalSteps={steps.length} />

      <Stage stepKey={`${step.id}-${animKey}`}>
        <StepVisual />
      </Stage>

      {step.pseudoCode && <PseudoCode code={step.pseudoCode} />}

      <nav class="step-nav" aria-label={navLabel}>
        <button
          type="button"
          class="step-nav__arrow"
          onMouseDown={(e) => e.preventDefault()}
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label={navPrevious}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>

        <div class="step-nav__dots" role="tablist" aria-label={navStepsList}>
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              class={`step-nav__dot ${i === currentIndex ? 'step-nav__dot--active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goTo(i)}
              aria-selected={i === currentIndex}
              aria-current={i === currentIndex ? 'step' : undefined}
              aria-label={`${stepCounter} ${i + 1}: ${s.title[locale]}`}
            />
          ))}
        </div>

        <button
          type="button"
          class="step-nav__arrow"
          onMouseDown={(e) => e.preventDefault()}
          onClick={goNext}
          disabled={currentIndex === steps.length - 1}
          aria-label={navNext}
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </nav>
    </div>
  )
}
