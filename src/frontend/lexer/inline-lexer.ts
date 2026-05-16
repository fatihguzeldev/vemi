import { Lexer } from 'src/frontend/lexer/lexer.js'
import type { SourceContext } from 'src/frontend/source-context.js'
import type {
  BacktickRunToken,
  DelimiterRunToken,
  EscapedTextToken,
  InlineToken,
  LeftBracketToken,
  LeftParenToken,
  RightBracketToken,
  RightParenToken,
  TextToken,
} from 'src/types/tokens.js'

const INLINE_DELIMITERS = '*_`[]()\\'
const ESCAPABLE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/

export class InlineLexer extends Lexer<InlineToken> {
  /**
   * @param context document source context
   * @param range utf-16 span to lex
   */
  constructor(context: SourceContext, range = context.span) {
    super(context, range)
  }

  protected scanToken(): void {
    const start = this.offset()

    if (this.tryEscape(start)) return
    if (this.tryBacktickRun(start)) return
    if (this.tryDelimiterRun(start)) return
    if (this.tryPunctuation(start)) return

    this.readUntilOneOf(INLINE_DELIMITERS)

    if (this.offset() > start) {
      this.emit<TextToken>({ type: 'text', span: this.spanFrom(start) })
    }
  }

  private tryEscape(start: number): boolean {
    if (!this.matchChar('\\')) return false

    const escaped = this.peek()

    if (ESCAPABLE.test(escaped)) {
      this.consumeChar()
      this.emit<EscapedTextToken>({
        type: 'escapedText',
        span: this.spanFrom(start),
        contentSpan: { start: start + 1, end: this.offset() },
      })

      return true
    }

    this.emit<TextToken>({ type: 'text', span: this.spanFrom(start) })

    return true
  }

  private tryBacktickRun(start: number): boolean {
    if (this.peek() !== '`') return false

    const length = this.consumeRun('`')
    this.emit<BacktickRunToken>({ type: 'backtickRun', span: this.spanFrom(start), length })

    return true
  }

  private tryDelimiterRun(start: number): boolean {
    const marker = this.peek()

    if (marker !== '*' && marker !== '_') return false

    const length = this.consumeRun(marker)
    this.emit<DelimiterRunToken>({
      type: 'delimiterRun',
      span: this.spanFrom(start),
      marker,
      length,
    })

    return true
  }

  private tryPunctuation(start: number): boolean {
    if (this.matchChar('[')) {
      this.emit<LeftBracketToken>({ type: 'leftBracket', span: this.spanFrom(start) })

      return true
    }

    if (this.matchChar(']')) {
      this.emit<RightBracketToken>({ type: 'rightBracket', span: this.spanFrom(start) })

      return true
    }

    if (this.matchChar('(')) {
      this.emit<LeftParenToken>({ type: 'leftParen', span: this.spanFrom(start) })

      return true
    }

    if (this.matchChar(')')) {
      this.emit<RightParenToken>({ type: 'rightParen', span: this.spanFrom(start) })

      return true
    }

    return false
  }

  private consumeRun(char: string): number {
    let length = 0

    while (this.peek() === char) {
      this.consumeChar()
      length++
    }

    return length
  }

  private readUntilOneOf(delimiters: string): void {
    while (!this.isAtEnd()) {
      const char = this.peek()

      if (delimiters.includes(char)) break

      this.consumeChar()
    }
  }
}
