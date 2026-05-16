import { Lexer } from 'src/frontend/lexer/lexer.js'
import type { SourceContext } from 'src/frontend/source-context.js'
import type {
  BlockToken,
  BlankLineToken,
  BlockquoteToken,
  CodeBlockContentToken,
  CodeBlockEndToken,
  CodeBlockStartToken,
  HeadingToken,
  ListItemToken,
  OrderedListItemToken,
  TextLineToken,
} from 'src/types/tokens.js'

export class BlockLexer extends Lexer<BlockToken> {
  constructor(context: SourceContext) {
    super(context)
  }

  private inCodeBlock = false
  private currentFence: string | null = null
  private codeBlockLineNumber = 0

  protected scanToken(): void {
    const { text: line, span: lineSpan } = this.readLine()

    // 1. inside code block
    if (this.inCodeBlock) {
      const fence = this.currentFence

      if (fence !== null && line.startsWith(fence)) {
        this.emit<CodeBlockEndToken>({
          type: 'codeBlockEnd',
          span: lineSpan,
          fence,
        })

        this.inCodeBlock = false
        this.currentFence = null
        this.codeBlockLineNumber = 0
      } else {
        this.codeBlockLineNumber++
        this.emit<CodeBlockContentToken>({
          type: 'codeBlockContent',
          span: lineSpan,
          lineInBlock: this.codeBlockLineNumber,
        })
      }

      return
    }

    // 2. blank line
    if (line.trim() === '') {
      this.emit<BlankLineToken>({
        type: 'blankLine',
        span: lineSpan,
      })

      return
    }

    // 3. fenced code start
    const fence = this.getFence(line)

    if (fence) {
      const language = this.extractLanguage(line, fence)

      this.emit<CodeBlockStartToken>({
        type: 'codeBlockStart',
        span: lineSpan,
        fence,
        language,
      })

      this.inCodeBlock = true
      this.currentFence = fence
      this.codeBlockLineNumber = 0

      return
    }

    // 4. heading (#)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)

    if (headingMatch) {
      const level = headingMatch[1]!.length as 1 | 2 | 3 | 4 | 5 | 6
      const content = headingMatch[2]!
      const matched = headingMatch[0]!
      const contentStartInLine = matched.length - content.length
      const contentStart = lineSpan.start + contentStartInLine

      this.emit<HeadingToken>({
        type: 'heading',
        span: lineSpan,
        level,
        contentSpan: { start: contentStart, end: contentStart + content.length },
      })

      return
    }

    // 5. ordered list
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/)

    if (orderedMatch) {
      const content = orderedMatch[2]!
      const matched = orderedMatch[0]!
      const contentStartInLine = matched.length - content.length
      const contentStart = lineSpan.start + contentStartInLine

      this.emit<OrderedListItemToken>({
        type: 'orderedListItem',
        span: lineSpan,
        number: parseInt(orderedMatch[1]!, 10),
        contentSpan: { start: contentStart, end: contentStart + content.length },
      })

      return
    }

    // 6. unordered list
    const listMatch = line.match(/^([-*+])\s+(.*)$/)

    if (listMatch) {
      const content = listMatch[2]!
      const matched = listMatch[0]!
      const contentStartInLine = matched.length - content.length
      const contentStart = lineSpan.start + contentStartInLine

      this.emit<ListItemToken>({
        type: 'listItem',
        span: lineSpan,
        marker: listMatch[1]!,
        contentSpan: { start: contentStart, end: contentStart + content.length },
      })

      return
    }

    // 7. blockquote
    const quoteMatch = line.match(/^>\s?(.*)$/)

    if (quoteMatch) {
      const content = quoteMatch[1]!
      const matched = quoteMatch[0]!
      const contentStartInLine = matched.length - content.length
      const contentStart = lineSpan.start + contentStartInLine

      this.emit<BlockquoteToken>({
        type: 'blockquote',
        span: lineSpan,
        contentSpan: { start: contentStart, end: contentStart + content.length },
      })

      return
    }

    // 8. default text
    this.emit<TextLineToken>({
      type: 'textLine',
      span: lineSpan,
    })
  }

  private readLine(): { text: string; span: { start: number; end: number } } {
    const start = this.offset()
    let result = ''

    while (!this.isAtEnd()) {
      const char = this.consumeChar()
      if (char === '\n') return { text: result, span: { start, end: this.offset() - 1 } }
      result += char
    }

    return { text: result, span: { start, end: this.offset() } }
  }

  private getFence(line: string): string | null {
    if (line.startsWith('```')) return '```'

    if (line.startsWith('~~~')) return '~~~'

    return null
  }

  private extractLanguage(line: string, fence: string): string | undefined {
    const rest = line.slice(fence.length).trim()

    if (rest === '') return undefined

    const match = rest.match(/^(\S+)/)

    return match?.[1]
  }
}
