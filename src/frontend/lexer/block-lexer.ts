import { Lexer } from './lexer.js'
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
  private inCodeBlock = false
  private currentFence: string | null = null
  private codeBlockLineNumber = 0

  protected scanToken(): void {
    const lineStartPos = this.getPosition()
    const line = this.readLine()

    // 1. inside code block
    if (this.inCodeBlock) {
      if (this.isFence(line) && this.currentFence !== null) {
        this.emit<CodeBlockEndToken>({
          type: 'codeBlockEnd',
          position: lineStartPos,
          fence: this.currentFence,
        })

        this.inCodeBlock = false
        this.currentFence = null
        this.codeBlockLineNumber = 0
      } else {
        this.codeBlockLineNumber++
        this.emit<CodeBlockContentToken>({
          type: 'codeBlockContent',
          position: lineStartPos,
          content: line,
          lineInBlock: this.codeBlockLineNumber,
        })
      }

      return
    }

    // 2. blank line
    if (line.trim() === '') {
      this.emit<BlankLineToken>({
        type: 'blankLine',
        position: lineStartPos,
      })

      return
    }

    // 3. fenced code start
    const fence = this.getFence(line)

    if (fence) {
      const language = this.extractLanguage(line, fence)

      this.emit<CodeBlockStartToken>({
        type: 'codeBlockStart',
        position: lineStartPos,
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

      this.emit<HeadingToken>({
        type: 'heading',
        position: lineStartPos,
        level,
        content,
      })

      return
    }

    // 5. ordered list
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/)

    if (orderedMatch) {
      this.emit<OrderedListItemToken>({
        type: 'orderedListItem',
        position: lineStartPos,
        number: parseInt(orderedMatch[1]!, 10),
        content: orderedMatch[2]!,
      })

      return
    }

    // 6. unordered list
    const listMatch = line.match(/^([-*+])\s+(.*)$/)

    if (listMatch) {
      this.emit<ListItemToken>({
        type: 'listItem',
        position: lineStartPos,
        marker: listMatch[1]!,
        content: listMatch[2]!,
      })

      return
    }

    // 7. blockquote
    const quoteMatch = line.match(/^>\s?(.*)$/)

    if (quoteMatch) {
      this.emit<BlockquoteToken>({
        type: 'blockquote',
        position: lineStartPos,
        content: quoteMatch[1]!,
      })

      return
    }

    // 8. default text
    this.emit<TextLineToken>({
      type: 'textLine',
      position: lineStartPos,
      content: line,
    })
  }

  private readLine(): string {
    let result = ''

    while (!this.isAtEnd()) {
      const char = this.advance()
      if (char === '\n') break
      result += char
    }

    return result
  }

  private isFence(line: string): boolean {
    return this.currentFence !== null && line.startsWith(this.currentFence)
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
