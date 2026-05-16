import { describe, it, expect } from 'vitest'
import { SourceContext } from 'src/frontend/source-context.js'
import { InlineParser } from 'src/frontend/parser/inline-parser.js'
import type { InlineRoot } from 'src/types/ast.js'
import type { InlineToken, SourceSpan } from 'src/types/tokens.js'

const sp = (start: number, end: number): SourceSpan => ({ start, end })

function parse(source: string, tokens: InlineToken[], rootSpan = sp(0, source.length)): InlineRoot {
  return new InlineParser(tokens, new SourceContext(source), rootSpan).parse()
}

describe('InlineParser', () => {
  it('returns inlineRoot with the requested span when token list is empty', () => {
    const root = parse('', [], sp(0, 0))
    expect(root.type).toBe('inlineRoot')
    expect(root.span).toEqual({ start: 0, end: 0 })
    expect(root.children).toEqual([])
  })

  it('uses first and last token spans as inlineRoot span', () => {
    const root = parse('xxhello', [{ type: 'text', span: sp(2, 7) }])
    expect(root.span).toEqual({ start: 2, end: 7 })
  })

  it('parses and merges adjacent text-like tokens', () => {
    const root = parse('\\*x', [
      { type: 'escapedText', span: sp(0, 2), contentSpan: sp(1, 2) },
      { type: 'text', span: sp(2, 3) },
    ])
    expect(root.children).toHaveLength(1)
    expect(root.children[0]).toMatchObject({
      type: 'text',
      span: sp(0, 3),
      content: '*x',
    })
  })

  it('resolves strong with text between matching delimiter runs', () => {
    const root = parse('**bold**', [
      { type: 'delimiterRun', span: sp(0, 2), marker: '*', length: 2 },
      { type: 'text', span: sp(2, 6) },
      { type: 'delimiterRun', span: sp(6, 8), marker: '*', length: 2 },
    ])
    expect(root.children).toHaveLength(1)
    const s = root.children[0]!
    expect(s.type).toBe('strong')
    if (s.type === 'strong') {
      expect(s.span).toEqual(sp(0, 8))
      expect(s.children).toHaveLength(1)
      expect(s.children[0]).toMatchObject({ type: 'text', content: 'bold' })
    }
  })

  it('resolves emphasis with text between matching delimiter runs', () => {
    const root = parse('*em*', [
      { type: 'delimiterRun', span: sp(0, 1), marker: '*', length: 1 },
      { type: 'text', span: sp(1, 3) },
      { type: 'delimiterRun', span: sp(3, 4), marker: '*', length: 1 },
    ])
    expect(root.children).toHaveLength(1)
    const e = root.children[0]!
    expect(e.type).toBe('emphasis')
    if (e.type === 'emphasis') {
      expect(e.span).toEqual(sp(0, 4))
      expect(e.children[0]).toMatchObject({ type: 'text', content: 'em' })
    }
  })

  it('resolves triple delimiter runs as strong containing emphasis', () => {
    const root = parse('***x***', [
      { type: 'delimiterRun', span: sp(0, 3), marker: '*', length: 3 },
      { type: 'text', span: sp(3, 4) },
      { type: 'delimiterRun', span: sp(4, 7), marker: '*', length: 3 },
    ])
    const strong = root.children[0]!
    expect(strong.type).toBe('strong')
    if (strong.type === 'strong') {
      expect(strong.children[0]!.type).toBe('emphasis')
      if (strong.children[0]!.type === 'emphasis') {
        expect(strong.children[0]!.children[0]).toMatchObject({ type: 'text', content: 'x' })
      }
    }
  })

  it('parses inline code from matching backtick runs', () => {
    const root = parse('`x`', [
      { type: 'backtickRun', span: sp(0, 1), length: 1 },
      { type: 'text', span: sp(1, 2) },
      { type: 'backtickRun', span: sp(2, 3), length: 1 },
    ])
    expect(root.children[0]).toMatchObject({
      type: 'code',
      span: sp(0, 3),
      content: 'x',
    })
  })

  it('treats unmatched backtick runs as literal text', () => {
    const root = parse('`oops', [
      { type: 'backtickRun', span: sp(0, 1), length: 1 },
      { type: 'text', span: sp(1, 5) },
    ])
    expect(root.children).toHaveLength(1)
    expect(root.children[0]).toMatchObject({ type: 'text', content: '`oops' })
  })

  it('parses inline links from bracket text and balanced destination parens', () => {
    const source = '[label](https://a.test)'
    const root = parse(source, [
      { type: 'leftBracket', span: sp(0, 1) },
      { type: 'text', span: sp(1, 6) },
      { type: 'rightBracket', span: sp(6, 7) },
      { type: 'leftParen', span: sp(7, 8) },
      { type: 'text', span: sp(8, 22) },
      { type: 'rightParen', span: sp(22, 23) },
    ])
    const link = root.children[0]!
    expect(link.type).toBe('link')
    if (link.type === 'link') {
      expect(link.span).toEqual(sp(0, 23))
      expect(link.url).toBe('https://a.test')
      expect(link.text).toHaveLength(1)
      expect(link.text[0]).toMatchObject({ type: 'text', content: 'label' })
    }
  })

  it('treats bracket text without a destination as literal text', () => {
    const root = parse('[ref]', [
      { type: 'leftBracket', span: sp(0, 1) },
      { type: 'text', span: sp(1, 4) },
      { type: 'rightBracket', span: sp(4, 5) },
    ])
    expect(root.children).toHaveLength(1)
    expect(root.children[0]).toMatchObject({ type: 'text', content: '[ref]' })
  })

  it('does not resolve nested links inside link text', () => {
    const source = '[a [b](u)](v)'
    const root = parse(source, [
      { type: 'leftBracket', span: sp(0, 1) },
      { type: 'text', span: sp(1, 3) },
      { type: 'leftBracket', span: sp(3, 4) },
      { type: 'text', span: sp(4, 5) },
      { type: 'rightBracket', span: sp(5, 6) },
      { type: 'leftParen', span: sp(6, 7) },
      { type: 'text', span: sp(7, 8) },
      { type: 'rightParen', span: sp(8, 9) },
      { type: 'rightBracket', span: sp(9, 10) },
      { type: 'leftParen', span: sp(10, 11) },
      { type: 'text', span: sp(11, 12) },
      { type: 'rightParen', span: sp(12, 13) },
    ])
    const link = root.children[0]!
    expect(link.type).toBe('link')
    if (link.type === 'link') {
      expect(link.url).toBe('v')
      expect(link.text).toHaveLength(1)
      expect(link.text[0]).toMatchObject({ type: 'text', content: 'a [b](u)' })
    }
  })

  it('treats intraword underscores as literal text', () => {
    const root = parse('foo_bar_baz', [
      { type: 'text', span: sp(0, 3) },
      { type: 'delimiterRun', span: sp(3, 4), marker: '_', length: 1 },
      { type: 'text', span: sp(4, 7) },
      { type: 'delimiterRun', span: sp(7, 8), marker: '_', length: 1 },
      { type: 'text', span: sp(8, 11) },
    ])
    expect(root.children).toHaveLength(1)
    expect(root.children[0]).toMatchObject({ type: 'text', content: 'foo_bar_baz' })
  })
})
