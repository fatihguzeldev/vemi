import { SourceLines } from '../components/SourceLines'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { tourSourceLines, zoomLineIndex } from '../data/tour'

export function TwoLayersStep() {
  const inlineLayerBadge = useT(ui.inlineLayerBadge)

  return (
    <div class="two-layers-step">
      <SourceLines
        lines={tourSourceLines}
        highlightLine={zoomLineIndex + 1}
        dimOtherLines
        animate={false}
      />
      <div class="two-layers-step__zoom animate-fade-in stagger-2">
        <span class="two-layers-step__badge">{inlineLayerBadge}</span>
        <code class="two-layers-step__line">{tourSourceLines[zoomLineIndex]}</code>
      </div>
    </div>
  )
}
