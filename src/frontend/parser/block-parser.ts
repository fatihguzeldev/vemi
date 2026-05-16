import { ParseError } from 'src/errors/parse-error.js'
import { Parser } from 'src/frontend/parser/parser.js'
import { parseInlineChildren } from 'src/frontend/parser/parse-inline-children.js'
import { spanFrom, type SourceContext } from 'src/frontend/source-context.js'
import type {
  BlockToken,
  BlockquoteToken,
  CodeBlockContentToken,
  CodeBlockStartToken,
  HeadingToken,
  ListItemToken,
  OrderedListItemToken,
  SourceSpan,
  TextLineToken,
} from 'src/types/tokens.js'
import type {
  Root,
  BlockNode,
  Paragraph,
  Heading,
  CodeBlock,
  List,
  OrderedList,
  ListItem,
  Blockquote,
} from 'src/types/ast.js'

export class BlockParser extends Parser<BlockToken, Root> {
  constructor(tokens: BlockToken[], context: SourceContext) {
    super(tokens, context)
  }

  parse(): Root {
    return {
      type: 'root',
      span: this.context.span,
      children: this.parseBlocks(),
    }
  }

  private parseBlocks(): BlockNode[] {
    const children: BlockNode[] = []

    while (!this.isAtEnd()) {
      const codeBlockStart = this.matchToken('codeBlockStart')

      if (codeBlockStart) {
        children.push(this.parseCodeBlock(codeBlockStart))

        continue
      }

      const heading = this.matchToken('heading')

      if (heading) {
        children.push(this.parseHeading(heading))

        continue
      }

      const listItem = this.matchToken('listItem')

      if (listItem) {
        children.push(this.parseList(listItem))

        continue
      }

      const orderedListItem = this.matchToken('orderedListItem')

      if (orderedListItem) {
        children.push(this.parseOrderedList(orderedListItem))

        continue
      }

      const blockquote = this.matchToken('blockquote')

      if (blockquote) {
        children.push(this.parseBlockquote(blockquote))

        continue
      }

      const textLine = this.matchToken('textLine')

      if (textLine) {
        children.push(this.parseParagraph(textLine))

        continue
      }

      const blankLine = this.matchToken('blankLine')

      if (blankLine) {
        children.push({ type: 'blankLine', span: blankLine.span })
        continue
      }

      const bad = this.peek()!

      throw new ParseError(
        `Unexpected block token \`${bad.type}\` at ${this.context.describe(bad.span.start)}.`,
        bad.span,
        this.context,
      )
    }

    return children
  }

  private parseCodeBlock(start: CodeBlockStartToken): CodeBlock {
    const lines: CodeBlockContentToken[] = []

    while (this.peek()?.type === 'codeBlockContent') {
      const t = this.consumeToken() as CodeBlockContentToken
      lines.push(t)
    }

    const end = this.expectToken('codeBlockEnd')

    return {
      type: 'codeBlock',
      span: spanFrom(start.span, end.span),
      language: start.language,
      content: lines.map((t) => this.context.slice(t.span)).join('\n'),
    }
  }

  private parseHeading(t: HeadingToken): Heading {
    return {
      type: 'heading',
      span: t.span,
      level: t.level,
      children: parseInlineChildren(this.context, t.contentSpan),
    }
  }

  private parseParagraph(first: TextLineToken): Paragraph {
    const lines: TextLineToken[] = [first]

    let last = first

    while (this.peek()?.type === 'textLine') {
      last = this.expectToken('textLine')
      lines.push(last)
    }

    const merged = lines.map((l) => this.context.slice(l.span)).join('\n')
    const spanStart = first.span.start
    const spanEnd = last.span.end
    const paragraphSpan: SourceSpan = { start: spanStart, end: spanEnd }
    const slice = this.context.slice(paragraphSpan)

    if (slice !== merged) {
      throw new ParseError(
        `Paragraph text does not match its source span at ${this.context.describe(first.span.start)}.`,
        first.span,
        this.context,
      )
    }

    return {
      type: 'paragraph',
      span: paragraphSpan,
      children: parseInlineChildren(this.context, paragraphSpan),
    }
  }

  private parseList(first: ListItemToken): List {
    const items: ListItem[] = [this.parseListItem(first)]
    let listSpan = first.span

    while (this.peek()?.type === 'listItem') {
      const t = this.expectToken('listItem')
      items.push(this.parseListItem(t))
      listSpan = spanFrom(first.span, t.span)
    }

    return {
      type: 'list',
      span: listSpan,
      children: items,
    }
  }

  private parseOrderedList(first: OrderedListItemToken): OrderedList {
    const items: ListItem[] = [this.parseOrderedListItem(first)]
    let listSpan = first.span

    while (this.peek()?.type === 'orderedListItem') {
      const t = this.expectToken('orderedListItem')
      items.push(this.parseOrderedListItem(t))
      listSpan = spanFrom(first.span, t.span)
    }

    return {
      type: 'orderedList',
      span: listSpan,
      children: items,
    }
  }

  private parseBlockquote(first: BlockquoteToken): Blockquote {
    const children: BlockNode[] = [this.wrapContentAsParagraph(first.contentSpan)]
    let blockquoteSpan = first.span

    while (this.peek()?.type === 'blockquote') {
      const t = this.expectToken('blockquote')
      children.push(this.wrapContentAsParagraph(t.contentSpan))
      blockquoteSpan = spanFrom(first.span, t.span)
    }

    return {
      type: 'blockquote',
      span: blockquoteSpan,
      children,
    }
  }

  private parseListItem(t: ListItemToken): ListItem {
    return {
      type: 'listItem',
      span: t.span,
      children: [this.wrapContentAsParagraph(t.contentSpan)],
    }
  }

  private parseOrderedListItem(t: OrderedListItemToken): ListItem {
    return {
      type: 'listItem',
      span: t.span,
      children: [this.wrapContentAsParagraph(t.contentSpan)],
    }
  }

  private wrapContentAsParagraph(contentSpan: SourceSpan): Paragraph {
    return {
      type: 'paragraph',
      span: contentSpan,
      children: parseInlineChildren(this.context, contentSpan),
    }
  }
}
