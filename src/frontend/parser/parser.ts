import { ParseError } from 'src/errors/parse-error.js'
import type { BaseToken } from 'src/types/tokens.js'
import type { BaseNode } from 'src/types/ast.js'
import type { SourceContext } from 'src/frontend/source-context.js'

export abstract class Parser<TToken extends BaseToken<string>, TNode extends BaseNode<string>> {
  protected readonly tokens: TToken[]
  protected current: number = 0
  protected readonly context: SourceContext

  constructor(tokens: TToken[], context: SourceContext) {
    this.tokens = tokens
    this.context = context

    let previousStart = 0

    for (const token of tokens) {
      this.context.assertSpan(token.span)

      if (token.span.start < previousStart) {
        throw new RangeError(
          `tokens must be ordered by source span start, got ${token.span.start} after ${previousStart}`,
        )
      }

      previousStart = token.span.start
    }
  }

  /**
   * entrypoint for parsing
   */

  abstract parse(): TNode

  // --- navigation utilities ---

  protected isAtEnd(): boolean {
    return this.current >= this.tokens.length
  }

  protected peek(offset = 0): TToken | null {
    const index = this.current + offset

    return index < this.tokens.length ? this.tokens[index]! : null
  }

  protected consumeToken(): TToken | null {
    const token = this.peek()

    if (!token) return null

    this.current++

    return token
  }

  protected matchToken<T extends TToken['type']>(type: T): Extract<TToken, { type: T }> | null {
    const token = this.peek()

    if (token?.type === type) {
      this.consumeToken()

      return token as Extract<TToken, { type: T }>
    }

    return null
  }

  protected expectToken<T extends TToken['type']>(type: T): Extract<TToken, { type: T }> {
    const token = this.peek()

    if (!token || token.type !== type) {
      const span = token?.span ?? {
        start: this.context.source.length,
        end: this.context.source.length,
      }
      const where = token
        ? this.context.describe(token.span.start)
        : `end of input (${this.context.describe(this.context.source.length)})`

      throw new ParseError(
        `Expected \`${type}\` at ${where}; got ${token?.type ?? 'end of input'}.`,
        span,
        this.context,
      )
    }

    this.consumeToken()

    return token as Extract<TToken, { type: T }>
  }
}
