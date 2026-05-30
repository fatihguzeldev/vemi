import { CodegenWalk } from '../components/CodegenWalk'
import { tourCodegenWalk, tourHtmlFormatted } from '../data/tour'

export function CodegenStep() {
  return (
    <div class="codegen-step">
      <CodegenWalk steps={tourCodegenWalk} resultHtml={tourHtmlFormatted} />
    </div>
  )
}
