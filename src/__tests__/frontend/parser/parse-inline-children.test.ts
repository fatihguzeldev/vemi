import { describe, it, expect } from 'vitest'
import { parseInlineChildren } from 'src/frontend/parser/parse-inline-children.js'
import { SourceContext } from 'src/frontend/source-context.js'
import type { InlineNode } from 'src/types/ast.js'

function parse(source: string, start = 0, end = source.length): InlineNode[] {
  return parseInlineChildren(new SourceContext(source), { start, end })
}

describe('parseInlineChildren', () => {
  it('returns empty array for empty string', () => {
    expect(parse('', 0, 0)).toEqual([])
  })

  it('returns a single text node for plain prose', () => {
    const s = 'hello world'
    const nodes = parse(s)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({
      type: 'text',
      content: 'hello world',
      span: { start: 0, end: 11 },
    })
  })

  it('aligns text node spans with the document range', () => {
    const pre = 'a'.repeat(100)
    const doc = pre + 'ab'
    const nodes = parse(doc, 100, 102)
    expect(nodes[0]).toMatchObject({
      type: 'text',
      content: 'ab',
      span: { start: 100, end: 102 },
    })
  })

  it('parses emphasis into emphasis node with text child', () => {
    const s = '*foo*'
    const nodes = parse(s)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('emphasis')
    if (nodes[0]!.type === 'emphasis') {
      expect(nodes[0]!.children).toHaveLength(1)
      expect(nodes[0]!.children[0]!).toMatchObject({ type: 'text', content: 'foo' })
    }
  })

  it('parses strong into strong node with text child', () => {
    const s = '**bar**'
    const nodes = parse(s)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('strong')
    if (nodes[0]!.type === 'strong') {
      expect(nodes[0]!.children).toHaveLength(1)
      expect(nodes[0]!.children[0]!).toMatchObject({ type: 'text', content: 'bar' })
    }
  })

  it('parses inline code', () => {
    const s = '`x`'
    const nodes = parse(s)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'code', content: 'x' })
  })

  it('does not parse delimiters inside inline code', () => {
    const nodes = parse('`*x* [y](z)`')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'code', content: '*x* [y](z)' })
  })

  it('supports matching backtick runs around code containing single backticks', () => {
    const nodes = parse('``x ` y``')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'code', content: 'x ` y' })
  })

  it('parses autolink-style markdown link with url', () => {
    const s = '[click](https://example.org)'
    const nodes = parse(s)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('link')
    if (nodes[0]!.type === 'link') {
      expect(nodes[0]!.url).toBe('https://example.org')
      expect(nodes[0]!.text).toHaveLength(1)
      expect(nodes[0]!.text[0]!).toMatchObject({ type: 'text', content: 'click' })
    }
  })

  it('parses adjacent inline constructs in order', () => {
    const s = 'a **b** c'
    const nodes = parse(s)
    expect(nodes).toHaveLength(3)
    expect(nodes[0]).toMatchObject({ type: 'text', content: 'a ' })
    expect(nodes[1]!.type).toBe('strong')
    expect(nodes[2]).toMatchObject({ type: 'text', content: ' c' })
  })

  it('preserves newlines inside a single prose span', () => {
    const s = 'line1\nline2'
    const nodes = parse(s)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: 'line1\nline2' })
  })

  it('treats unmatched backticks as literal text', () => {
    const nodes = parse('`unclosed')

    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: '`unclosed' })
  })

  it('treats unmatched emphasis delimiters as literal text', () => {
    const nodes = parse('*unclosed')

    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: '*unclosed' })
  })

  it('treats mismatched strong delimiters as literal text', () => {
    const nodes = parse('**wrong__')

    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: '**wrong__' })
  })

  it('treats a link opener without link text close as literal text', () => {
    const nodes = parse('[x')

    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: '[x' })
  })

  it('does not let links cross enclosing emphasis delimiters', () => {
    const nodes = parse('*[x*]')

    expect(nodes).toHaveLength(2)
    expect(nodes[0]!.type).toBe('emphasis')
    if (nodes[0]!.type === 'emphasis') {
      expect(nodes[0]!.children).toHaveLength(1)
      expect(nodes[0]!.children[0]).toMatchObject({ type: 'text', content: '[x' })
    }
    expect(nodes[1]).toMatchObject({ type: 'text', content: ']' })
  })

  it('treats link url syntax without closing paren as literal text', () => {
    const nodes = parse('[x](u')

    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: '[x](u' })
  })

  it('parses link text with multiple inline segments', () => {
    const s = '[a **b** c](https://x)'
    const nodes = parse(s)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('link')
    if (nodes[0]!.type === 'link') {
      expect(nodes[0]!.text).toHaveLength(3)
      expect(nodes[0]!.text[0]!).toMatchObject({ type: 'text', content: 'a ' })
      expect(nodes[0]!.text[1]!.type).toBe('strong')
      expect(nodes[0]!.text[2]!).toMatchObject({ type: 'text', content: ' c' })
    }
  })

  it('parses triple delimiter runs as strong containing emphasis', () => {
    const nodes = parse('***x***')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('strong')
    if (nodes[0]!.type === 'strong') {
      expect(nodes[0]!.children[0]!.type).toBe('emphasis')
    }
  })

  it('resolves nested delimiter pairs through an opener stack', () => {
    const nodes = parse('*a **b** c*')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('emphasis')
    if (nodes[0]!.type === 'emphasis') {
      expect(nodes[0]!.children).toHaveLength(3)
      expect(nodes[0]!.children[0]).toMatchObject({ type: 'text', content: 'a ' })
      expect(nodes[0]!.children[1]!.type).toBe('strong')
      expect(nodes[0]!.children[2]).toMatchObject({ type: 'text', content: ' c' })
    }
  })

  it('resolves longer delimiter runs without special-casing only one through three', () => {
    const nodes = parse('*****x*****')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('strong')
    if (nodes[0]!.type === 'strong') {
      const innerStrong = nodes[0]!.children[0]!
      expect(innerStrong.type).toBe('strong')
      if (innerStrong.type === 'strong') {
        expect(innerStrong.children[0]!.type).toBe('emphasis')
      }
    }
  })

  it('keeps intraword underscores as text', () => {
    const nodes = parse('foo_bar_baz')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: 'foo_bar_baz' })
  })

  it('keeps empty delimiter pairs as text', () => {
    const nodes = parse('****')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: '****' })
  })

  it('balances parentheses inside link destinations', () => {
    const nodes = parse('[x](https://example.test/a_(b))')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('link')
    if (nodes[0]!.type === 'link') {
      expect(nodes[0]!.url).toBe('https://example.test/a_(b)')
    }
  })

  it('does not throw on nested link-looking text', () => {
    const nodes = parse('[a [b](u)](v)')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('link')
    if (nodes[0]!.type === 'link') {
      expect(nodes[0]!.url).toBe('v')
      expect(nodes[0]!.text[0]).toMatchObject({ type: 'text', content: 'a [b](u)' })
    }
  })

  it('treats escaped delimiters as text', () => {
    const nodes = parse('\\*x\\*')
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ type: 'text', content: '*x*' })
  })
})
