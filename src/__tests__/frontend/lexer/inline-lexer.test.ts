import { describe, it, expect } from 'vitest'
import { InlineLexer } from 'src/frontend/lexer/inline-lexer.js'
import { SourceContext } from 'src/frontend/source-context.js'
import type {
  BacktickRunToken,
  DelimiterRunToken,
  EscapedTextToken,
  InlineToken,
  TextToken,
} from 'src/types/tokens.js'

function lex(
  source: string,
  start = 0,
  end = source.length,
): {
  context: SourceContext
  tokens: InlineToken[]
} {
  const context = new SourceContext(source)

  return { context, tokens: new InlineLexer(context, { start, end }).tokenize() }
}

describe('InlineLexer', () => {
  it('returns no tokens for empty input', () => {
    expect(lex('', 0, 0).tokens).toEqual([])
  })

  it('tokenizes plain text as one text token with a span', () => {
    const { context, tokens } = lex('hello')
    expect(tokens).toHaveLength(1)
    const t = tokens[0] as TextToken
    expect(t.type).toBe('text')
    expect(t.span).toEqual({ start: 0, end: 5 })
    expect(context.slice(t.span)).toBe('hello')
  })

  it('tokenizes delimiter runs without deciding their meaning', () => {
    const { context, tokens } = lex('***foo___')

    expect(tokens.map((t) => t.type)).toEqual(['delimiterRun', 'text', 'delimiterRun'])
    expect(tokens[0]).toMatchObject<Partial<DelimiterRunToken>>({
      type: 'delimiterRun',
      marker: '*',
      length: 3,
      span: { start: 0, end: 3 },
    })
    expect(context.slice(tokens[1]!.span)).toBe('foo')
    expect(tokens[2]).toMatchObject<Partial<DelimiterRunToken>>({
      type: 'delimiterRun',
      marker: '_',
      length: 3,
      span: { start: 6, end: 9 },
    })
  })

  it('tokenizes backtick runs without consuming code content', () => {
    const { context, tokens } = lex('``x``')

    expect(tokens.map((t) => t.type)).toEqual(['backtickRun', 'text', 'backtickRun'])
    expect(tokens[0]).toMatchObject<Partial<BacktickRunToken>>({
      type: 'backtickRun',
      length: 2,
      span: { start: 0, end: 2 },
    })
    expect(context.slice(tokens[1]!.span)).toBe('x')
    expect(tokens[2]).toMatchObject<Partial<BacktickRunToken>>({
      type: 'backtickRun',
      length: 2,
      span: { start: 3, end: 5 },
    })
  })

  it('tokenizes brackets and parentheses as raw punctuation', () => {
    const { context, tokens } = lex('[x](u)')

    expect(tokens.map((t) => t.type)).toEqual([
      'leftBracket',
      'text',
      'rightBracket',
      'leftParen',
      'text',
      'rightParen',
    ])
    expect(context.slice(tokens[1]!.span)).toBe('x')
    expect(context.slice(tokens[4]!.span)).toBe('u')
  })

  it('tokenizes backslash escapes as escaped text', () => {
    const { context, tokens } = lex('\\*x')

    expect(tokens.map((t) => t.type)).toEqual(['escapedText', 'text'])
    const escaped = tokens[0] as EscapedTextToken
    expect(escaped.span).toEqual({ start: 0, end: 2 })
    expect(escaped.contentSpan).toEqual({ start: 1, end: 2 })
    expect(context.slice(escaped.contentSpan)).toBe('*')
  })

  it('aligns spans with the document string when the lex range is not at offset 0', () => {
    const doc = 'x'.repeat(50) + 'hi'
    const { tokens } = lex(doc, 50, 52)
    expect(tokens).toHaveLength(1)
    expect((tokens[0] as TextToken).span).toEqual({ start: 50, end: 52 })
  })
})
