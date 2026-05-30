import type { CodegenWalkStep } from '../data/types'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { HtmlEmit } from './HtmlEmit'
import { useReducedMotion } from '../hooks/useReducedMotion'

type CodegenWalkProps = {
  steps: CodegenWalkStep[]
  resultHtml: string
}

export function CodegenWalk({ steps, resultHtml }: CodegenWalkProps) {
  const reduced = useReducedMotion()
  const walkLabel = useT(ui.codegenWalkLabel)
  const emitsLabel = useT(ui.codegenEmitsLabel)
  const bufferTitle = useT(ui.codegenBufferTitle)
  const bufferSubtitle = useT(ui.codegenBufferSubtitle)

  return (
    <div class="codegen-walk">
      <ol class="codegen-walk__steps" aria-label={walkLabel}>
        {steps.map((step, i) => (
          <li
            class={`codegen-walk__step ${!reduced ? `animate-fade-in stagger-${Math.min(i + 1, 10)}` : ''}`}
          >
            <div class="codegen-walk__index" aria-hidden="true">
              {i + 1}
            </div>
            <div class="codegen-walk__node">
              <span class="codegen-walk__node-label">{step.node}</span>
              <code class="codegen-walk__pattern">{step.pattern}</code>
              {step.detail && <span class="codegen-walk__detail">{step.detail}</span>}
            </div>
            <div class="codegen-walk__emit" aria-hidden="true">
              <span class="codegen-walk__emit-arrow">→</span>
            </div>
            <div class="codegen-walk__output">
              <span class="codegen-walk__output-label">{emitsLabel}</span>
              <HtmlEmit html={step.html} compact />
            </div>
          </li>
        ))}
      </ol>

      <div
        class={`codegen-walk__buffer ${!reduced ? `animate-fade-in stagger-${Math.min(steps.length + 1, 10)}` : ''}`}
      >
        <header class="codegen-walk__buffer-header">
          <span class="codegen-walk__buffer-title">{bufferTitle}</span>
          <span class="codegen-walk__buffer-subtitle">{bufferSubtitle}</span>
        </header>
        <HtmlEmit html={resultHtml} formatted />
      </div>
    </div>
  )
}
