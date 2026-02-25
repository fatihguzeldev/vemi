import { describe, it, expect } from 'vitest'
import { BlockLexer } from '../../../frontend/lexer/block-lexer.js'
import type {
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

describe('BlockLexer', () => {
  it('returns no tokens for empty input', () => {
    expect(new BlockLexer('').tokenize()).toEqual([])
  })

  it('tokenizes a plain line as one textLine with content and position', () => {
    const tokens = new BlockLexer('hello world').tokenize()
    expect(tokens).toHaveLength(1)
    const t = tokens[0] as TextLineToken
    expect(t.type).toBe('textLine')
    expect(t.content).toBe('hello world')
    expect(t.position).toEqual({ line: 1, column: 1 })
  })

  it('tokenizes a blank line as blankLine', () => {
    const tokens = new BlockLexer('\n').tokenize()
    expect(tokens).toHaveLength(1)
    expect((tokens[0] as BlankLineToken).type).toBe('blankLine')
  })

  it('tokenizes heading with level and content', () => {
    const tokens = new BlockLexer('# h1').tokenize()
    expect(tokens).toHaveLength(1)
    const h = tokens[0] as HeadingToken
    expect(h.type).toBe('heading')
    expect(h.level).toBe(1)
    expect(h.content).toBe('h1')
  })

  it('tokenizes unordered list item with marker and content', () => {
    const tokens = new BlockLexer('- item').tokenize()
    expect(tokens).toHaveLength(1)
    const li = tokens[0] as ListItemToken
    expect(li.type).toBe('listItem')
    expect(li.marker).toBe('-')
    expect(li.content).toBe('item')
  })

  it('tokenizes ordered list item with number and content', () => {
    const tokens = new BlockLexer('1. first').tokenize()
    expect(tokens).toHaveLength(1)
    const li = tokens[0] as OrderedListItemToken
    expect(li.type).toBe('orderedListItem')
    expect(li.number).toBe(1)
    expect(li.content).toBe('first')
  })

  it('tokenizes blockquote with content', () => {
    const tokens = new BlockLexer('> quote').tokenize()
    expect(tokens).toHaveLength(1)
    const bq = tokens[0] as BlockquoteToken
    expect(bq.type).toBe('blockquote')
    expect(bq.content).toBe('quote')
  })

  it('tokenizes fenced code block as start, content lines, end with language and fence', () => {
    const source = '```ts\nconst x = 1\n```'
    const tokens = new BlockLexer(source).tokenize()
    expect(tokens).toHaveLength(3)

    const start = tokens[0] as CodeBlockStartToken
    expect(start.type).toBe('codeBlockStart')
    expect(start.language).toBe('ts')
    expect(start.fence).toBe('```')

    const content = tokens[1] as CodeBlockContentToken
    expect(content.type).toBe('codeBlockContent')
    expect(content.content).toBe('const x = 1')
    expect(content.lineInBlock).toBe(1)

    const end = tokens[2] as CodeBlockEndToken
    expect(end.type).toBe('codeBlockEnd')
    expect(end.fence).toBe('```')
  })

  it('produces tokens in source order for multiple lines', () => {
    const tokens = new BlockLexer('# Title\n\nA paragraph.').tokenize()
    expect(tokens).toHaveLength(3)
    expect(tokens[0]!.type).toBe('heading')
    expect(tokens[1]!.type).toBe('blankLine')
    expect(tokens[2]!.type).toBe('textLine')
  })
})
