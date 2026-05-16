import { describe, it, expect } from 'vitest'
import { Lexer } from 'src/frontend/lexer/lexer.js'
import { SourceContext } from 'src/frontend/source-context.js'
import type { BaseToken, SourceSpan } from 'src/types/tokens.js'

type TestToken = BaseToken<'test'>

/**
 * concrete lexer used to test base Lexer behavior. exposes protected methods
 * so we can assert peek, consumeChar, matchChar, matchString, offsets, and tokenize loop.
 */
class TestableLexer extends Lexer<TestToken> {
  constructor(source: string, rangeStart = 0, rangeEnd = source.length) {
    super(new SourceContext(source), { start: rangeStart, end: rangeEnd })
  }

  protected scanToken(): void {
    if (this.isAtEnd()) return

    const start = this.offset()

    this.consumeChar()
    this.emit<TestToken>({ type: 'test', span: this.spanFrom(start) })
  }

  public testPeek(offset?: number): string {
    return this.peek(offset)
  }

  public testConsumeChar(): string {
    return this.consumeChar()
  }

  public testMatchChar(expected: string): boolean {
    return this.matchChar(expected)
  }

  public testMatchString(expected: string): boolean {
    return this.matchString(expected)
  }

  public testOffset(): number {
    return this.offset()
  }

  public testSpanFrom(start: number): SourceSpan {
    return this.spanFrom(start)
  }

  public testIsAtEnd(): boolean {
    return this.isAtEnd()
  }
}

describe('Lexer (base)', () => {
  describe('isAtEnd', () => {
    it('is true when source is empty', () => {
      const lexer = new TestableLexer('')
      expect(lexer.testIsAtEnd()).toBe(true)
    })

    it('is false when there is at least one character', () => {
      const lexer = new TestableLexer('a')
      expect(lexer.testIsAtEnd()).toBe(false)
    })

    it('becomes true after advancing past the last character', () => {
      const lexer = new TestableLexer('a')
      lexer.testConsumeChar()
      expect(lexer.testIsAtEnd()).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns current character at offset 0 without consuming', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testPeek(0)).toBe('a')
      expect(lexer.testPeek(0)).toBe('a')
    })

    it('returns character at offset 1 without consuming', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testPeek(1)).toBe('b')
    })

    it('returns \\0 when offset is past end', () => {
      const lexer = new TestableLexer('a')
      expect(lexer.testPeek(1)).toBe('\0')
    })

    it('returns \\0 when source is empty', () => {
      const lexer = new TestableLexer('')
      expect(lexer.testPeek(0)).toBe('\0')
    })
  })

  describe('consumeChar', () => {
    it('returns current character and moves the cursor forward', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testConsumeChar()).toBe('a')
      expect(lexer.testPeek(0)).toBe('b')
      expect(lexer.testConsumeChar()).toBe('b')
      expect(lexer.testIsAtEnd()).toBe(true)
    })

    it('returns \\0 when already at end and does not move', () => {
      const lexer = new TestableLexer('a')
      lexer.testConsumeChar()
      expect(lexer.testConsumeChar()).toBe('\0')
      expect(lexer.testIsAtEnd()).toBe(true)
    })

    it('tracks only the current source offset for non-newline characters', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testOffset()).toBe(0)
      lexer.testConsumeChar()
      expect(lexer.testOffset()).toBe(1)
      lexer.testConsumeChar()
      expect(lexer.testOffset()).toBe(2)
    })

    it('does not special-case newline in the hot advance path', () => {
      const lexer = new TestableLexer('a\nb')
      lexer.testConsumeChar()
      expect(lexer.testOffset()).toBe(1)
      lexer.testConsumeChar()
      expect(lexer.testOffset()).toBe(2)
    })
  })

  describe('matchChar', () => {
    it('returns true and consumes when current character equals expected', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testMatchChar('a')).toBe(true)
      expect(lexer.testPeek(0)).toBe('b')
    })

    it('returns false and does not consume when current character differs', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testMatchChar('x')).toBe(false)
      expect(lexer.testPeek(0)).toBe('a')
    })

    it('returns false when at end', () => {
      const lexer = new TestableLexer('a')
      lexer.testConsumeChar()
      expect(lexer.testMatchChar('a')).toBe(false)
    })
  })

  describe('matchString', () => {
    it('returns true and consumes full string when it matches', () => {
      const lexer = new TestableLexer('abc')
      expect(lexer.testMatchString('ab')).toBe(true)
      expect(lexer.testPeek(0)).toBe('c')
    })

    it('returns false and does not consume when string does not match', () => {
      const lexer = new TestableLexer('abc')
      expect(lexer.testMatchString('ax')).toBe(false)
      expect(lexer.testPeek(0)).toBe('a')
    })

    it('returns false and does not consume when prefix matches but rest does not', () => {
      const lexer = new TestableLexer('abc')
      expect(lexer.testMatchString('abcd')).toBe(false)
      expect(lexer.testPeek(0)).toBe('a')
    })

    it('leaves the cursor unchanged on partial match', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testMatchString('abc')).toBe(false)
      expect(lexer.testOffset()).toBe(0)
    })
  })

  describe('spanFrom', () => {
    it('returns a half-open span from a saved start to current offset', () => {
      const lexer = new TestableLexer('x')
      lexer.testConsumeChar()
      expect(lexer.testSpanFrom(0)).toEqual({ start: 0, end: 1 })
    })

    it('starts the lex window at a document offset', () => {
      const doc = 'a'.repeat(100) + 'x'
      const lexer = new TestableLexer(doc, 100, 101)
      expect(lexer.testOffset()).toBe(100)
    })

    it('rejects lex ranges outside the source document', () => {
      expect(() => new TestableLexer('abc', 0, 4)).toThrow(RangeError)
      expect(() => new TestableLexer('abc', 2, 1)).toThrow(RangeError)
    })
  })

  describe('tokenize', () => {
    it('returns empty array for empty source', () => {
      const tokens = new TestableLexer('').tokenize()
      expect(tokens).toEqual([])
    })

    it('calls scanToken until isAtEnd and returns all emitted tokens', () => {
      const tokens = new TestableLexer('ab').tokenize()
      expect(tokens).toHaveLength(2)
      expect(tokens[0]!.span).toEqual({ start: 0, end: 1 })
      expect(tokens[1]!.span).toEqual({ start: 1, end: 2 })
    })

    it('stops when isAtEnd becomes true', () => {
      const tokens = new TestableLexer('xyz').tokenize()
      expect(tokens).toHaveLength(3)
    })
  })
})
