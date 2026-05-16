import { describe, expect, it } from 'vitest'
import { SourceContext, span, spanFrom } from 'src/frontend/source-context.js'

describe('SourceContext', () => {
  it('slices only valid half-open spans', () => {
    const context = new SourceContext('hello')

    expect(context.slice({ start: 1, end: 4 })).toBe('ell')
  })

  it('exposes explicit span assertions for phase boundaries', () => {
    const context = new SourceContext('hello')

    expect(() => context.assertSpan({ start: 0, end: 5 })).not.toThrow()
    expect(() => context.assertSpan({ start: 0, end: 6 })).toThrow(RangeError)
    expect(() => context.assertSpan({ start: -1, end: 2 })).toThrow(RangeError)
    expect(() => context.assertSpan({ start: 3, end: 2 })).toThrow(RangeError)
  })

  it('derives source points from trusted offsets', () => {
    const context = new SourceContext('a\nbc')

    expect(context.point(2)).toEqual({ line: 2, column: 1, offset: 2 })
    expect(context.point(4)).toEqual({ line: 2, column: 3, offset: 4 })
  })

  it('exposes explicit offset assertions for phase boundaries', () => {
    const context = new SourceContext('a\nbc')

    expect(() => context.assertOffset(4)).not.toThrow()
    expect(() => context.assertOffset(5)).toThrow(RangeError)
  })

  it('constructs spans through small helpers', () => {
    expect(span(1, 3)).toEqual({ start: 1, end: 3 })
    expect(spanFrom({ start: 1, end: 2 }, { start: 2, end: 5 })).toEqual({
      start: 1,
      end: 5,
    })
  })
})
