import type { BaseToken, SourcePosition } from 'src/types/tokens.js'

/**
 * a lexer instance is single-use.
 * create a new instance for each input source.
 */
export abstract class Lexer<TToken extends BaseToken<string>> {
  protected readonly source: string
  protected readonly tokens: TToken[] = []

  protected current = 0
  protected line = 1
  protected column = 1

  constructor(source: string) {
    this.source = source
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
    return this.current >= this.source.length
  }

  protected peek(offset = 0): string {
    const index = this.current + offset

    if (index >= this.source.length) return '\0'

    return this.source[index]!
  }

  protected advance(): string {
    if (this.isAtEnd()) return '\0'

    const char = this.source[this.current++]

    if (char === '\n') {
      this.line++
      this.column = 1
    } else {
      this.column++
    }

    return char!
  }

  protected match(expected: string): boolean {
    if (this.isAtEnd()) return false

    if (this.source[this.current] !== expected) return false

    this.advance()

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
      this.advance()
    }

    return true
  }

  protected getPosition(): SourcePosition {
    return {
      line: this.line,
      column: this.column,
    }
  }

  /**
   * appends a token.
   */
  protected emit<T extends TToken>(token: T): void {
    this.tokens.push(token)
  }
}
