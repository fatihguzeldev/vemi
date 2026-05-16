import type { SourceContext } from 'src/frontend/source-context.js'
import type { SourcePosition, SourceSpan } from 'src/types/tokens.js'

export class ParseError extends Error {
  readonly span: SourceSpan
  readonly start: SourcePosition
  readonly end: SourcePosition

  constructor(message: string, span: SourceSpan, context: SourceContext) {
    super(message)
    this.name = 'ParseError'
    this.span = span
    this.start = context.point(span.start)
    this.end = context.point(span.end)
  }
}
