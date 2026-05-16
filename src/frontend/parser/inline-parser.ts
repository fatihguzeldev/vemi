import { Parser } from 'src/frontend/parser/parser.js'
import { spanFrom, type SourceContext } from 'src/frontend/source-context.js'
import type {
  BacktickRunToken,
  DelimiterRunToken,
  EscapedTextToken,
  InlineToken,
  LeftParenToken,
} from 'src/types/tokens.js'
import type { SourceSpan } from 'src/types/tokens.js'
import type { Emphasis, InlineNode, InlineRoot, Strong, Text } from 'src/types/ast.js'

type ParseOptions = {
  allowLinks: boolean
}

type ParsedNode = {
  node: InlineNode
  next: number
}

type NodeItem = {
  kind: 'node'
  node: InlineNode
}

type DelimiterItem = {
  kind: 'delimiter'
  token: DelimiterRunToken
  canOpen: boolean
  canClose: boolean
}

type InlineItem = NodeItem | DelimiterItem

type DelimiterPair = {
  open: number
  close: number
  useLength: number
}

export class InlineParser extends Parser<InlineToken, InlineRoot> {
  private readonly rootSpan: SourceSpan

  constructor(tokens: InlineToken[], context: SourceContext, rootSpan: SourceSpan = context.span) {
    super(tokens, context)
    context.assertSpan(rootSpan)
    this.rootSpan = rootSpan
  }

  parse(): InlineRoot {
    const first = this.tokens[0]
    const last = this.tokens[this.tokens.length - 1]

    return {
      type: 'inlineRoot',
      span: first && last ? spanFrom(first.span, last.span) : this.rootSpan,
      children: this.parseRange(0, this.tokens.length, { allowLinks: true }),
    }
  }

  private parseRange(start: number, end: number, options: ParseOptions): InlineNode[] {
    const items: InlineItem[] = []
    let index = start

    while (index < end) {
      const token = this.tokens[index]!

      if (token.type === 'delimiterRun') {
        items.push(this.delimiterItem(token))
        index++
        continue
      }

      const parsed = this.parseAt(index, end, options)
      items.push({ kind: 'node', node: parsed.node })
      index = parsed.next
    }

    return this.resolveDelimiters(items)
  }

  private parseAt(index: number, end: number, options: ParseOptions): ParsedNode {
    const token = this.tokens[index]!

    if (token.type === 'text') return { node: this.textNode(token), next: index + 1 }
    if (token.type === 'escapedText') return { node: this.escapedTextNode(token), next: index + 1 }

    if (token.type === 'backtickRun') {
      return this.parseCodeSpan(index, end) ?? { node: this.textNode(token), next: index + 1 }
    }

    if (token.type === 'leftBracket') {
      return this.parseLink(index, end, options) ?? { node: this.textNode(token), next: index + 1 }
    }

    return { node: this.textNode(token), next: index + 1 }
  }

  private parseCodeSpan(index: number, end: number): ParsedNode | null {
    const start = this.tokens[index] as BacktickRunToken
    const closeIndex = this.findBacktickClose(index, end, start.length)

    if (closeIndex === -1) return null

    const close = this.tokens[closeIndex]!
    const contentSpan = { start: start.span.end, end: close.span.start }

    return {
      node: {
        type: 'code',
        span: spanFrom(start.span, close.span),
        content: this.context.slice(contentSpan),
      },
      next: closeIndex + 1,
    }
  }

  private parseLink(index: number, end: number, options: ParseOptions): ParsedNode | null {
    if (!options.allowLinks) return null

    const textEndIndex = this.findLinkTextEnd(index, end)
    if (textEndIndex === -1) return null

    const openParenIndex = textEndIndex + 1
    const openParen = this.tokens[openParenIndex]
    if (openParen?.type !== 'leftParen') return null

    const closeParenIndex = this.findLinkDestinationEnd(openParenIndex, end)
    if (closeParenIndex === -1) return null

    const start = this.tokens[index]!
    const closeParen = this.tokens[closeParenIndex]!
    const urlSpan = { start: (openParen as LeftParenToken).span.end, end: closeParen.span.start }

    return {
      node: {
        type: 'link',
        span: spanFrom(start.span, closeParen.span),
        text: this.parseRange(index + 1, textEndIndex, { allowLinks: false }),
        url: this.decodeEscapes(this.context.slice(urlSpan)),
      },
      next: closeParenIndex + 1,
    }
  }

  private findBacktickClose(index: number, end: number, length: number): number {
    for (let i = index + 1; i < end; i++) {
      const token = this.tokens[i]!
      if (token.type === 'backtickRun' && token.length === length) return i
    }

    return -1
  }

  private findLinkTextEnd(index: number, end: number): number {
    let depth = 0

    for (let i = index + 1; i < end; i++) {
      const token = this.tokens[i]!

      if (token.type === 'backtickRun') {
        const codeClose = this.findBacktickClose(i, end, token.length)
        if (codeClose !== -1) i = codeClose
        continue
      }

      if (token.type === 'leftBracket') {
        depth++
        continue
      }

      if (token.type === 'rightBracket') {
        if (depth === 0) return i
        depth--
      }
    }

    return -1
  }

  private findLinkDestinationEnd(index: number, end: number): number {
    let depth = 0

    for (let i = index + 1; i < end; i++) {
      const token = this.tokens[i]!

      if (token.type === 'leftParen') {
        depth++
        continue
      }

      if (token.type === 'rightParen') {
        if (depth === 0) return i
        depth--
      }
    }

    return -1
  }

  private delimiterItem(token: DelimiterRunToken): DelimiterItem {
    const before = this.context.source[token.span.start - 1]
    const after = this.context.source[token.span.end]
    const beforeIsWhitespace = this.isWhitespace(before)
    const afterIsWhitespace = this.isWhitespace(after)
    const beforeIsPunctuation = this.isPunctuation(before)
    const afterIsPunctuation = this.isPunctuation(after)
    const leftFlanking =
      !afterIsWhitespace && (!afterIsPunctuation || beforeIsWhitespace || beforeIsPunctuation)
    const rightFlanking =
      !beforeIsWhitespace && (!beforeIsPunctuation || afterIsWhitespace || afterIsPunctuation)

    return {
      kind: 'delimiter',
      token,
      canOpen:
        token.marker === '_'
          ? leftFlanking && (!rightFlanking || beforeIsPunctuation)
          : leftFlanking,
      canClose:
        token.marker === '_'
          ? rightFlanking && (!leftFlanking || afterIsPunctuation)
          : rightFlanking,
    }
  }

  private resolveDelimiters(items: InlineItem[]): InlineNode[] {
    const pairs = this.collectDelimiterPairs(items)

    return this.renderItems(items, pairs, 0, items.length)
  }

  private collectDelimiterPairs(items: InlineItem[]): DelimiterPair[] {
    const pairs: DelimiterPair[] = []
    const openerStack: number[] = []

    for (let index = 0; index < items.length; index++) {
      const item = items[index]!

      if (item.kind !== 'delimiter') continue

      if (item.canClose) {
        const openerStackIndex = this.findOpener(openerStack, items, item)

        if (openerStackIndex !== -1) {
          const openerIndex = openerStack[openerStackIndex]!
          const opener = items[openerIndex] as DelimiterItem

          pairs.push({
            open: openerIndex,
            close: index,
            useLength: Math.min(opener.token.length, item.token.length),
          })
          openerStack.splice(openerStackIndex, 1)
          continue
        }
      }

      if (item.canOpen) openerStack.push(index)
    }

    return pairs
  }

  private findOpener(openerStack: number[], items: InlineItem[], closer: DelimiterItem): number {
    for (let i = openerStack.length - 1; i >= 0; i--) {
      const opener = items[openerStack[i]!] as DelimiterItem

      if (opener.token.marker === closer.token.marker && this.canPairDelimiters(opener, closer)) {
        return i
      }
    }

    return -1
  }

  private canPairDelimiters(opener: DelimiterItem, closer: DelimiterItem): boolean {
    if (!opener.canOpen || !closer.canClose) return false

    if (
      (opener.canClose || closer.canOpen) &&
      (opener.token.length + closer.token.length) % 3 === 0
    ) {
      return opener.token.length % 3 === 0 || closer.token.length % 3 === 0
    }

    return true
  }

  private renderItems(
    items: InlineItem[],
    pairs: DelimiterPair[],
    start: number,
    end: number,
  ): InlineNode[] {
    const nodes: InlineNode[] = []
    let index = start

    while (index < end) {
      const pair = this.findPairOpeningAt(pairs, index, end)

      if (pair) {
        const opener = items[pair.open] as DelimiterItem
        const closer = items[pair.close] as DelimiterItem
        const children = this.renderItems(items, pairs, pair.open + 1, pair.close)

        this.appendNode(
          nodes,
          this.wrapDelimiterNodes(opener.token.span, closer.token.span, pair.useLength, children),
        )
        index = pair.close + 1
        continue
      }

      const item = items[index]!
      this.appendNode(nodes, item.kind === 'node' ? item.node : this.textNode(item.token))
      index++
    }

    return nodes
  }

  private findPairOpeningAt(
    pairs: DelimiterPair[],
    open: number,
    end: number,
  ): DelimiterPair | null {
    let selected: DelimiterPair | null = null

    for (const pair of pairs) {
      if (pair.open !== open || pair.close >= end) continue
      if (!selected || pair.close > selected.close) selected = pair
    }

    return selected
  }

  private wrapDelimiterNodes(
    open: SourceSpan,
    close: SourceSpan,
    useLength: number,
    children: InlineNode[],
  ): InlineNode {
    const wrappers: Array<{ type: 'strong' | 'emphasis'; offset: number }> = []
    let nodeChildren = children
    let remaining = useLength
    let consumed = 0

    while (remaining >= 2) {
      wrappers.push({ type: 'strong', offset: consumed })
      consumed += 2
      remaining -= 2
    }

    if (remaining === 1) {
      wrappers.push({ type: 'emphasis', offset: consumed })
    }

    for (let i = wrappers.length - 1; i >= 0; i--) {
      const wrapper = wrappers[i]!
      const span = { start: open.start + wrapper.offset, end: close.end - wrapper.offset }

      nodeChildren = [
        wrapper.type === 'strong'
          ? ({ type: 'strong', span, children: nodeChildren } satisfies Strong)
          : ({ type: 'emphasis', span, children: nodeChildren } satisfies Emphasis),
      ]
    }

    return nodeChildren[0]!
  }

  private isWhitespace(char: string | undefined): boolean {
    return char === undefined || /\s/.test(char)
  }

  private isPunctuation(char: string | undefined): boolean {
    return char !== undefined && /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(char)
  }

  private textNode(token: Pick<InlineToken, 'span'>): Text {
    return {
      type: 'text',
      span: token.span,
      content: this.context.slice(token.span),
    }
  }

  private escapedTextNode(token: EscapedTextToken): Text {
    return {
      type: 'text',
      span: token.span,
      content: this.context.slice(token.contentSpan),
    }
  }

  private appendNode(nodes: InlineNode[], node: InlineNode): void {
    const previous = nodes[nodes.length - 1]

    if (previous?.type === 'text' && node.type === 'text') {
      previous.span = spanFrom(previous.span, node.span)
      previous.content += node.content
      return
    }

    nodes.push(node)
  }

  private decodeEscapes(value: string): string {
    return value.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, '$1')
  }
}
