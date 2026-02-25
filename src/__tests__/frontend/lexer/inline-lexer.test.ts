import { describe, it, expect } from 'vitest'
import { InlineLexer } from '../../../frontend/lexer/inline-lexer.js'
import type {
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

describe('InlineLexer', () => {
  it('returns no tokens for empty input', () => {
    expect(new InlineLexer('').tokenize()).toEqual([])
  })

  it('tokenizes plain text as one text token with content and position', () => {
    const tokens = new InlineLexer('hello').tokenize()
    expect(tokens).toHaveLength(1)
    const t = tokens[0] as TextToken
    expect(t.type).toBe('text')
    expect(t.content).toBe('hello')
    expect(t.position).toEqual({ line: 1, column: 1 })
  })

  it('tokenizes emphasis with start, text, end and same marker', () => {
    const tokens = new InlineLexer('*foo*').tokenize()
    expect(tokens).toHaveLength(3)
    const start = tokens[0] as EmphasisStartToken
    expect(start.type).toBe('emphasisStart')
    expect(start.marker).toBe('*')
    const text = tokens[1] as TextToken
    expect(text.type).toBe('text')
    expect(text.content).toBe('foo')
    const end = tokens[2] as EmphasisEndToken
    expect(end.type).toBe('emphasisEnd')
    expect(end.marker).toBe('*')
  })

  it('tokenizes strong with start, text, end', () => {
    const tokens = new InlineLexer('**bar**').tokenize()
    expect(tokens).toHaveLength(3)
    expect((tokens[0] as StrongStartToken).type).toBe('strongStart')
    expect((tokens[0] as StrongStartToken).marker).toBe('**')
    expect((tokens[1] as TextToken).content).toBe('bar')
    expect((tokens[2] as StrongEndToken).type).toBe('strongEnd')
  })

  it('tokenizes inline code with start, content, end', () => {
    const tokens = new InlineLexer('`x`').tokenize()
    expect(tokens).toHaveLength(3)
    expect((tokens[0] as CodeStartToken).type).toBe('codeStart')
    expect((tokens[1] as TextToken).content).toBe('x')
    expect((tokens[2] as CodeEndToken).type).toBe('codeEnd')
  })

  it('tokenizes link as linkStart, text, linkTextEnd, linkUrl, linkEnd with url', () => {
    const tokens = new InlineLexer('[click](https://example.org)').tokenize()
    expect(tokens).toHaveLength(5)
    expect((tokens[0] as LinkStartToken).type).toBe('linkStart')
    expect((tokens[1] as TextToken).content).toBe('click')
    expect((tokens[2] as LinkTextEndToken).type).toBe('linkTextEnd')
    const urlToken = tokens[3] as LinkUrlToken
    expect(urlToken.type).toBe('linkUrl')
    expect(urlToken.url).toBe('https://example.org')
    expect((tokens[4] as LinkEndToken).type).toBe('linkEnd')
  })

  it('treats wrong strong closer as literal text', () => {
    const tokens = new InlineLexer('**emphasis__').tokenize()
    expect(tokens).toHaveLength(3)
    expect((tokens[0] as StrongStartToken).type).toBe('strongStart')
    expect((tokens[1] as TextToken).content).toBe('emphasis')
    const literal = tokens[2] as TextToken
    expect(literal.type).toBe('text')
    expect(literal.content).toBe('__')
  })
})
