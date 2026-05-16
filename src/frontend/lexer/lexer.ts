import type { SourceContext } from 'src/frontend/source-context.js'
import type { BaseToken, SourceSpan } from 'src/types/tokens.js'

/**
 * a lexer instance is single-use.
 * create a new instance for each input source.
 */
export abstract class Lexer<TToken extends BaseToken<string>> {
  protected readonly context: SourceContext
  protected readonly tokens: TToken[] = []
  /** current UTF-16 index into `context.source` in [`rangeStart`, `rangeEnd`] */
  protected current: number
  protected readonly rangeStart: number
  protected readonly rangeEnd: number

  constructor(context: SourceContext, range: SourceSpan = context.span) {
    context.assertSpan(range)

    this.context = context
    this.rangeStart = range.start
    this.rangeEnd = range.end
    this.current = range.start
  }

  /**
   * runs the lexing loop and produces tokens.
   */
  tokenize(): TToken[] {
    while (!this.isAtEnd()) {
      this.scanToken()
    }

    return this.tokens
  }

  /**
   * subclasses must implement token recognition logic.
   */
  protected abstract scanToken(): void

  // --- utility methods ---

  protected isAtEnd(): boolean {
    return this.current >= this.rangeEnd
  }

  protected peek(offset = 0): string {
    const index = this.current + offset

    if (index >= this.rangeEnd) return '\0'

    return this.context.source[index]!
  }

  protected consumeChar(): string {
    if (this.isAtEnd()) return '\0'

    return this.context.source[this.current++]!
  }

  protected matchChar(expected: string): boolean {
    if (this.isAtEnd()) return false

    if (this.context.source[this.current] !== expected) return false

    this.consumeChar()

    return true
  }

  /**
   * consumes and returns true only if the next characters equal expected; otherwise leaves position unchanged.
   */
  protected matchString(expected: string): boolean {
    for (let i = 0; i < expected.length; i++) {
      if (this.peek(i) !== expected[i]) return false
    }

    for (let i = 0; i < expected.length; i++) {
      this.consumeChar()
    }

    return true
  }

  protected offset(): number {
    return this.current
  }

  protected spanFrom(start: number): SourceSpan {
    return { start, end: this.current }
  }

  /**
   * appends a token.
   */
  protected emit<T extends TToken>(token: T): void {
    this.tokens.push(token)
  }
}
