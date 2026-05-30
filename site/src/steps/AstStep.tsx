import { AstOutline } from '../components/AstOutline'
import { SourceLines } from '../components/SourceLines'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { tourAstOutline, tourSourceLines } from '../data/tour'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function AstStep() {
  const reduced = useReducedMotion()
  const insight = useT(ui.astInsight)
  const sourceTitle = useT(ui.astSourceTitle)
  const sourceSubtitle = useT(ui.astSourceSubtitle)
  const parseLabel = useT(ui.astParseLabel)
  const astTitle = useT(ui.astAstTitle)
  const astSubtitle = useT(ui.astAstSubtitle)

  return (
    <div class="ast-step">
      <p class={`ast-step__insight ${!reduced ? 'animate-fade-in' : ''}`}>{insight}</p>

      <div class="ast-compare">
        <section class={`ast-compare__panel ${!reduced ? 'animate-fade-in stagger-1' : ''}`}>
          <header class="ast-compare__header">
            <span class="ast-compare__title">{sourceTitle}</span>
            <span class="ast-compare__subtitle">{sourceSubtitle}</span>
          </header>
          <SourceLines lines={tourSourceLines} animate={!reduced} />
        </section>

        <div class={`ast-compare__bridge ${!reduced ? 'animate-fade-in stagger-2' : ''}`} aria-hidden="true">
          <span class="ast-compare__bridge-label">{parseLabel}</span>
          <span class="ast-compare__bridge-arrow">→</span>
        </div>

        <section class={`ast-compare__panel ast-compare__panel--ast ${!reduced ? 'animate-fade-in stagger-3' : ''}`}>
          <header class="ast-compare__header">
            <span class="ast-compare__title">{astTitle}</span>
            <span class="ast-compare__subtitle">{astSubtitle}</span>
          </header>
          <AstOutline nodes={tourAstOutline} />
        </section>
      </div>
    </div>
  )
}
