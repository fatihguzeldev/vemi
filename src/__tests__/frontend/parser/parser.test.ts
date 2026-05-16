import { describe, it, expect } from 'vitest'
import { SourceContext } from 'src/frontend/source-context.js'
import { Parser } from 'src/frontend/parser/parser.js'
import { ParseError } from 'src/errors/parse-error.js'
import type { BaseToken, SourceSpan } from 'src/types/tokens.js'
import type { BaseNode } from 'src/types/ast.js'

type DemoToken = BaseToken<'alpha'> | BaseToken<'beta'> | BaseToken<'gamma'>

type DemoNode = BaseNode<'demo'>

const sp = (start: number, end = start + 1): SourceSpan => ({ start, end })

function token<T extends DemoToken['type']>(
  type: T,
  start: number,
): Extract<DemoToken, { type: T }> {
  return { type, span: sp(start) } as Extract<DemoToken, { type: T }>
}

/**
 * minimal concrete parser to exercise base `Parser` navigation, `matchToken`, and `expectToken`.
 */
class TestableParser extends Parser<DemoToken, DemoNode> {
  constructor(tokens: DemoToken[], context = new SourceContext('0123456789')) {
    super(tokens, context)
  }

  parse(): DemoNode {
    return { type: 'demo', span: sp(0, 0) }
  }

  testIsAtEnd(): boolean {
    return this.isAtEnd()
  }

  testPeek(offset?: number): DemoToken | null {
    return this.peek(offset)
  }

  testConsumeToken(): DemoToken | null {
    return this.consumeToken()
  }

  testMatchToken<T extends DemoToken['type']>(type: T): Extract<DemoToken, { type: T }> | null {
    return this.matchToken(type)
  }

  testExpectToken<T extends DemoToken['type']>(t: T): Extract<DemoToken, { type: T }> {
    return this.expectToken(t)
  }
}

describe('Parser (base)', () => {
  describe('isAtEnd', () => {
    it('is true when there are no tokens', () => {
      const p = new TestableParser([])
      expect(p.testIsAtEnd()).toBe(true)
    })

    it('is false at start when tokens exist', () => {
      const p = new TestableParser([token('alpha', 0)])
      expect(p.testIsAtEnd()).toBe(false)
    })

    it('is true after advancing past the last token', () => {
      const p = new TestableParser([token('alpha', 0)])
      p.testConsumeToken()
      expect(p.testIsAtEnd()).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns current token at offset 0 without consuming', () => {
      const p = new TestableParser([token('alpha', 2), token('beta', 3)])
      expect(p.testPeek(0)).toEqual(token('alpha', 2))
      expect(p.testPeek(0)).toEqual(token('alpha', 2))
    })

    it('returns token at positive offset without consuming', () => {
      const p = new TestableParser([token('alpha', 0), token('beta', 1)])
      expect(p.testPeek(1)).toEqual(token('beta', 1))
      expect(p.testPeek(0)).toEqual(token('alpha', 0))
    })

    it('returns null when offset is past the end', () => {
      const p = new TestableParser([token('alpha', 0)])
      expect(p.testPeek(1)).toBeNull()
    })

    it('returns null when token list is empty', () => {
      const p = new TestableParser([])
      expect(p.testPeek(0)).toBeNull()
    })
  })

  describe('consumeToken', () => {
    it('returns current token and moves forward', () => {
      const a = token('alpha', 0)
      const b = token('beta', 1)
      const p = new TestableParser([a, b])
      expect(p.testConsumeToken()).toEqual(a)
      expect(p.testPeek(0)).toEqual(b)
    })

    it('returns null when already at end', () => {
      const p = new TestableParser([])
      expect(p.testConsumeToken()).toBeNull()
    })

    it('returns null after last token was consumed', () => {
      const p = new TestableParser([token('alpha', 0)])
      expect(p.testConsumeToken()).not.toBeNull()
      expect(p.testConsumeToken()).toBeNull()
    })
  })

  describe('matchToken', () => {
    it('consumes and returns token when first type matches', () => {
      const p = new TestableParser([token('beta', 5)])
      const got = p.testMatchToken('beta')
      expect(got).toEqual(token('beta', 5))
      expect(p.testIsAtEnd()).toBe(true)
    })

    it('returns null and does not consume when type does not match', () => {
      const p = new TestableParser([token('alpha', 0)])
      expect(p.testMatchToken('beta')).toBeNull()
      expect(p.testPeek(0)).toEqual(token('alpha', 0))
    })

    it('returns null at end without consuming', () => {
      const p = new TestableParser([])
      expect(p.testMatchToken('alpha')).toBeNull()
    })
  })

  describe('expectToken', () => {
    it('consumes and returns token when type matches', () => {
      const t = token('alpha', 3)
      const p = new TestableParser([t])
      expect(p.testExpectToken('alpha')).toEqual(t)
      expect(p.testIsAtEnd()).toBe(true)
    })

    it('throws when type differs', () => {
      const p = new TestableParser([token('beta', 2)])
      expect(() => p.testExpectToken('alpha')).toThrow(ParseError)
      expect(() => p.testExpectToken('alpha')).toThrow(/Expected `alpha`/)
      expect(() => p.testExpectToken('alpha')).toThrow(/got beta/)
      expect(p.testPeek(0)).toEqual(token('beta', 2))
    })

    it('throws at end of input with end of input message', () => {
      const p = new TestableParser([])
      expect(() => p.testExpectToken('alpha')).toThrow(ParseError)
      expect(() => p.testExpectToken('alpha')).toThrow(/Expected `alpha`/)
      expect(() => p.testExpectToken('alpha')).toThrow(/end of input/)
    })

    it('formats expected-token errors with line and column', () => {
      const p = new TestableParser([token('beta', 2)], new SourceContext('a\nb'))
      expect(() => p.testExpectToken('alpha')).toThrow(/line 2, column 1/)
    })

    it('adds structured source positions to parse errors', () => {
      const p = new TestableParser([token('beta', 2)], new SourceContext('a\nbc'))

      try {
        p.testExpectToken('alpha')
        throw new Error('expected ParseError')
      } catch (error) {
        expect(error).toBeInstanceOf(ParseError)
        expect(error).toMatchObject({
          span: { start: 2, end: 3 },
          start: { line: 2, column: 1, offset: 2 },
          end: { line: 2, column: 2, offset: 3 },
        })
      }
    })
  })

  it('rejects tokens whose spans do not belong to the source context', () => {
    expect(() => new TestableParser([token('alpha', 10)], new SourceContext('short'))).toThrow(
      RangeError,
    )
  })

  it('rejects token streams that are not ordered by source span', () => {
    expect(
      () => new TestableParser([token('alpha', 2), token('beta', 1)], new SourceContext('abc')),
    ).toThrow(RangeError)
  })
})
