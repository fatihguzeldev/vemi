import { HtmlSnippet } from '../components/HtmlSnippet'
import { PreviewPane } from '../components/PreviewPane'
import { tourHtml, tourHtmlFormatted } from '../data/tour'

export function OutputStep() {
  return (
    <div class="output-step">
      <HtmlSnippet html={tourHtmlFormatted} />
      <PreviewPane html={tourHtml} />
    </div>
  )
}
