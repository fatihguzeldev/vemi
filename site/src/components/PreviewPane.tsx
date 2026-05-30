import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'

type PreviewPaneProps = {
  html: string
  animate?: boolean
}

export function PreviewPane({ html, animate = true }: PreviewPaneProps) {
  const label = useT(ui.previewLabel)

  return (
    <div class={`preview-pane ${animate ? 'animate-fade-in stagger-2' : ''}`}>
      <div class="preview-pane__label">{label}</div>
      <div
        class="preview-pane__content"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
