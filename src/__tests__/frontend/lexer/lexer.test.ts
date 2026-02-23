import { describe, it, expect } from 'vitest'
import { Lexer } from '../../../frontend/lexer/lexer.js'
import type { BaseToken, SourcePosition } from 'src/types/tokens.js'

type TestToken = BaseToken<'test'>

/**
 * concrete lexer used to test base Lexer behavior. exposes protected methods
 * so we can assert peek, advance, match, matchString, position, and tokenize loop.
 */
class TestableLexer extends Lexer<TestToken> {
  protected scanToken(): void {
    if (this.isAtEnd()) return

    const pos = this.getPosition()

    this.advance()
    this.emit<TestToken>({ type: 'test', position: pos })
  }

  public testPeek(offset?: number): string {
    return this.peek(offset)
  }

  public testAdvance(): string {
    return this.advance()
  }

  public testMatch(expected: string): boolean {
    return this.match(expected)
  }

  public testMatchString(expected: string): boolean {
    return this.matchString(expected)
  }

  public testGetPosition(): SourcePosition {
    return this.getPosition()
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
      lexer.testAdvance()
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

  describe('advance', () => {
    it('returns current character and moves position forward', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testAdvance()).toBe('a')
      expect(lexer.testPeek(0)).toBe('b')
      expect(lexer.testAdvance()).toBe('b')
      expect(lexer.testIsAtEnd()).toBe(true)
    })

    it('returns \\0 when already at end and does not move', () => {
      const lexer = new TestableLexer('a')
      lexer.testAdvance()
      expect(lexer.testAdvance()).toBe('\0')
      expect(lexer.testIsAtEnd()).toBe(true)
    })

    it('increments column for non-newline characters', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testGetPosition()).toEqual({ line: 1, column: 1 })
      lexer.testAdvance()
      expect(lexer.testGetPosition()).toEqual({ line: 1, column: 2 })
      lexer.testAdvance()
      expect(lexer.testGetPosition()).toEqual({ line: 1, column: 3 })
    })

    it('increments line and resets column to 1 on newline', () => {
      const lexer = new TestableLexer('a\nb')
      lexer.testAdvance()
      expect(lexer.testGetPosition()).toEqual({ line: 1, column: 2 })
      lexer.testAdvance()
      expect(lexer.testGetPosition()).toEqual({ line: 2, column: 1 })
    })
  })

  describe('match', () => {
    it('returns true and consumes when current character equals expected', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testMatch('a')).toBe(true)
      expect(lexer.testPeek(0)).toBe('b')
    })

    it('returns false and does not consume when current character differs', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testMatch('x')).toBe(false)
      expect(lexer.testPeek(0)).toBe('a')
    })

    it('returns false when at end', () => {
      const lexer = new TestableLexer('a')
      lexer.testAdvance()
      expect(lexer.testMatch('a')).toBe(false)
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

    it('leaves position unchanged on partial match', () => {
      const lexer = new TestableLexer('ab')
      expect(lexer.testMatchString('abc')).toBe(false)
      expect(lexer.testGetPosition()).toEqual({ line: 1, column: 1 })
    })
  })

  describe('getPosition', () => {
    it('returns line 1 column 1 at start', () => {
      const lexer = new TestableLexer('x')
      expect(lexer.testGetPosition()).toEqual({ line: 1, column: 1 })
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
      expect(tokens[0]!.position).toEqual({ line: 1, column: 1 })
      expect(tokens[1]!.position).toEqual({ line: 1, column: 2 })
    })

    it('stops when isAtEnd becomes true', () => {
      const tokens = new TestableLexer('xyz').tokenize()
      expect(tokens).toHaveLength(3)
    })
  })
})
