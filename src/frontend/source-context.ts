import { buildLineStartOffsets, offsetToLineColumn } from 'src/frontend/lexer/line-index.js'
import type { SourcePosition, SourceSpan } from 'src/types/tokens.js'

/**
 * per-document source utilities. keep one context for a parse so spans,
 * slicing, and line/column derivation all refer to the same source string.
 */
export class SourceContext {
  readonly source: string
  private readonly lineStarts: readonly number[]

  constructor(source: string) {
    this.source = source
    this.lineStarts = buildLineStartOffsets(source)
  }

  get span(): SourceSpan {
    return { start: 0, end: this.source.length }
  }

  slice(span: SourceSpan): string {
    return this.source.slice(span.start, span.end)
  }

  point(offset: number): SourcePosition {
    const { line, column } = offsetToLineColumn(this.lineStarts, offset)

    return { line, column, offset }
  }

  describe(offset: number): string {
    const point = this.point(offset)

    return `line ${point.line}, column ${point.column}`
  }

  assertOffset(offset: number): void {
    if (!Number.isInteger(offset) || offset < 0 || offset > this.source.length) {
      throw new RangeError(
        `source offset must be an integer in [0, ${this.source.length}], got ${offset}`,
      )
    }
  }

  assertSpan(sourceSpan: SourceSpan): void {
    assertSpanShape(sourceSpan)

    if (sourceSpan.end > this.source.length) {
      throw new RangeError(
        `source span end must be <= source length ${this.source.length}, got ${sourceSpan.end}`,
      )
    }
  }
}

export function span(start: number, end: number): SourceSpan {
  return { start, end }
}

export function spanFrom(first: SourceSpan, last: SourceSpan): SourceSpan {
  return span(first.start, last.end)
}

function assertSpanShape(sourceSpan: SourceSpan): void {
  if (!Number.isInteger(sourceSpan.start) || !Number.isInteger(sourceSpan.end)) {
    throw new RangeError(
      `source span offsets must be integers, got [${sourceSpan.start}, ${sourceSpan.end})`,
    )
  }

  if (sourceSpan.start < 0 || sourceSpan.end < sourceSpan.start) {
    throw new RangeError(
      `source span must satisfy 0 <= start <= end, got [${sourceSpan.start}, ${sourceSpan.end})`,
    )
  }
}
