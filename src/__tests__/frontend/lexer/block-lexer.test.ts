import { describe, it, expect } from 'vitest'
import { BlockLexer } from 'src/frontend/lexer/block-lexer.js'
import { SourceContext } from 'src/frontend/source-context.js'
import type {
  BlockToken,
  TextLineToken,
  BlankLineToken,
  HeadingToken,
  ListItemToken,
  OrderedListItemToken,
  BlockquoteToken,
  CodeBlockStartToken,
  CodeBlockContentToken,
  CodeBlockEndToken,
} from 'src/types/tokens.js'

function lex(source: string): { context: SourceContext; tokens: BlockToken[] } {
  const context = new SourceContext(source)

  return { context, tokens: new BlockLexer(context).tokenize() }
}

describe('BlockLexer', () => {
  it('returns no tokens for empty input', () => {
    expect(lex('').tokens).toEqual([])
  })

  it('tokenizes a plain line as one textLine with a span', () => {
    const { context, tokens } = lex('hello world')
    expect(tokens).toHaveLength(1)
    const t = tokens[0] as TextLineToken
    expect(t.type).toBe('textLine')
    expect(t.span).toEqual({ start: 0, end: 11 })
    expect(context.slice(t.span)).toBe('hello world')
  })

  it('tokenizes a blank line as blankLine', () => {
    const { tokens } = lex('\n')
    expect(tokens).toHaveLength(1)
    expect((tokens[0] as BlankLineToken).type).toBe('blankLine')
    expect(tokens[0]!.span).toEqual({ start: 0, end: 0 })
  })

  it('tokenizes heading with level and content', () => {
    const { context, tokens } = lex('# h1')
    expect(tokens).toHaveLength(1)
    const h = tokens[0] as HeadingToken
    expect(h.type).toBe('heading')
    expect(h.level).toBe(1)
    expect(h.span).toEqual({ start: 0, end: 4 })
    expect(h.contentSpan).toEqual({ start: 2, end: 4 })
    expect(context.slice(h.contentSpan)).toBe('h1')
  })

  it('tokenizes unordered list item with marker and content', () => {
    const { context, tokens } = lex('- item')
    expect(tokens).toHaveLength(1)
    const li = tokens[0] as ListItemToken
    expect(li.type).toBe('listItem')
    expect(li.marker).toBe('-')
    expect(li.contentSpan).toEqual({ start: 2, end: 6 })
    expect(context.slice(li.contentSpan)).toBe('item')
  })

  it('tokenizes ordered list item with number and content', () => {
    const { context, tokens } = lex('1. first')
    expect(tokens).toHaveLength(1)
    const li = tokens[0] as OrderedListItemToken
    expect(li.type).toBe('orderedListItem')
    expect(li.number).toBe(1)
    expect(li.contentSpan).toEqual({ start: 3, end: 8 })
    expect(context.slice(li.contentSpan)).toBe('first')
  })

  it('tokenizes blockquote with content', () => {
    const { context, tokens } = lex('> quote')
    expect(tokens).toHaveLength(1)
    const bq = tokens[0] as BlockquoteToken
    expect(bq.type).toBe('blockquote')
    expect(bq.contentSpan).toEqual({ start: 2, end: 7 })
    expect(context.slice(bq.contentSpan)).toBe('quote')
  })

  it('tokenizes fenced code block as start, content lines, end with language and fence', () => {
    const source = '```ts\nconst x = 1\n```'
    const { context, tokens } = lex(source)
    expect(tokens).toHaveLength(3)

    const start = tokens[0] as CodeBlockStartToken
    expect(start.type).toBe('codeBlockStart')
    expect(start.language).toBe('ts')
    expect(start.fence).toBe('```')

    const content = tokens[1] as CodeBlockContentToken
    expect(content.type).toBe('codeBlockContent')
    expect(context.slice(content.span)).toBe('const x = 1')
    expect(content.lineInBlock).toBe(1)
    expect(content.span).toEqual({ start: 6, end: 17 })

    const end = tokens[2] as CodeBlockEndToken
    expect(end.type).toBe('codeBlockEnd')
    expect(end.fence).toBe('```')
  })

  it('produces tokens in source order for multiple lines', () => {
    const { tokens } = lex('# Title\n\nA paragraph.')
    expect(tokens).toHaveLength(3)
    expect(tokens[0]!.type).toBe('heading')
    expect(tokens[1]!.type).toBe('blankLine')
    expect(tokens[2]!.type).toBe('textLine')
  })
})
