import { Lexer } from './lexer.js'
import type {
  InlineToken,
  SourcePosition,
  TextToken,
  EmphasisStartToken,
  EmphasisEndToken,
  StrongStartToken,
  StrongEndToken,
  CodeStartToken,
  CodeEndToken,
  LinkStartToken,
  LinkTextEndToken,
  LinkUrlToken,
  LinkEndToken,
} from 'src/types/tokens.js'

const INLINE_DELIMITERS = '*_`[]'

export class InlineLexer extends Lexer<InlineToken> {
  private inCodeSpan = false
  private emphasisMarker: '*' | '_' | null = null
  private strongMarker: '**' | '__' | null = null

  protected scanToken(): void {
    const pos = this.getPosition()

    if (this.tryStrong(pos)) return
    if (this.tryEmphasis(pos)) return
    if (this.tryCodeSpan(pos)) return
    if (this.tryLink(pos)) return

    const content = this.readUntilOneOf(INLINE_DELIMITERS)

    if (content.length > 0) {
      this.emit<TextToken>({ type: 'text', position: pos, content })
    }
  }

  /** returns true if strong (** or __) was matched and emitted. */
  private tryStrong(pos: SourcePosition): boolean {
    if (this.matchString('**')) {
      if (this.strongMarker === null) {
        this.emit<StrongStartToken>({ type: 'strongStart', position: pos, marker: '**' })
        this.strongMarker = '**'
      } else if (this.strongMarker === '**') {
        this.emit<StrongEndToken>({ type: 'strongEnd', position: pos, marker: '**' })
        this.strongMarker = null
      } else {
        this.emit<TextToken>({ type: 'text', position: pos, content: '**' })
      }

      return true
    }

    if (this.matchString('__')) {
      if (this.strongMarker === null) {
        this.emit<StrongStartToken>({ type: 'strongStart', position: pos, marker: '__' })
        this.strongMarker = '__'
      } else if (this.strongMarker === '__') {
        this.emit<StrongEndToken>({ type: 'strongEnd', position: pos, marker: '__' })
        this.strongMarker = null
      } else {
        this.emit<TextToken>({ type: 'text', position: pos, content: '__' })
      }

      return true
    }

    return false
  }

  /** returns true if emphasis (* or _) was matched and emitted. */
  private tryEmphasis(pos: SourcePosition): boolean {
    if (this.match('*')) {
      if (this.emphasisMarker === null) {
        this.emit<EmphasisStartToken>({ type: 'emphasisStart', position: pos, marker: '*' })
        this.emphasisMarker = '*'
      } else if (this.emphasisMarker === '*') {
        this.emit<EmphasisEndToken>({ type: 'emphasisEnd', position: pos, marker: '*' })
        this.emphasisMarker = null
      } else {
        this.emit<TextToken>({ type: 'text', position: pos, content: '*' })
      }

      return true
    }

    if (this.match('_')) {
      if (this.emphasisMarker === null) {
        this.emit<EmphasisStartToken>({ type: 'emphasisStart', position: pos, marker: '_' })
        this.emphasisMarker = '_'
      } else if (this.emphasisMarker === '_') {
        this.emit<EmphasisEndToken>({ type: 'emphasisEnd', position: pos, marker: '_' })
        this.emphasisMarker = null
      } else {
        this.emit<TextToken>({ type: 'text', position: pos, content: '_' })
      }

      return true
    }

    return false
  }

  /** returns true if code span (`) was matched and emitted. */
  private tryCodeSpan(pos: SourcePosition): boolean {
    if (!this.match('`')) return false

    this.emit<CodeStartToken | CodeEndToken>({
      type: this.inCodeSpan ? 'codeEnd' : 'codeStart',
      position: pos,
      marker: '`',
    })

    this.inCodeSpan = !this.inCodeSpan

    return true
  }

  /** returns true if link [ ] or ](url) was matched and emitted. */
  private tryLink(pos: SourcePosition): boolean {
    if (this.match('[')) {
      this.emit<LinkStartToken>({ type: 'linkStart', position: pos })

      return true
    }

    if (this.match(']')) {
      this.emit<LinkTextEndToken>({ type: 'linkTextEnd', position: pos })

      if (this.peek() === '(') {
        this.advance()

        const urlStartPos = this.getPosition()
        const url = this.readUntil(')')
        const endPos = this.getPosition()

        this.advance()
        this.emit<LinkUrlToken>({ type: 'linkUrl', position: urlStartPos, url })
        this.emit<LinkEndToken>({ type: 'linkEnd', position: endPos })
      }

      return true
    }

    return false
  }

  private readUntil(terminator: string): string {
    let result = ''

    while (!this.isAtEnd() && this.peek() !== terminator) {
      result += this.advance()
    }

    return result
  }

  private readUntilOneOf(delimiters: string): string {
    let result = ''

    while (!this.isAtEnd()) {
      const char = this.peek()

      if (delimiters.includes(char)) break

      result += this.advance()
    }

    return result
  }
}
