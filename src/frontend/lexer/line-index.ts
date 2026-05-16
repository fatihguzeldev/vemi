/**
 * utf-16 code unit offsets in `source` where each **1-based** line starts.
 * line 1 always begins at 0; line k begins immediately after the (k-1)th `'\n'`.
 */
export function buildLineStartOffsets(source: string): number[] {
  const out: number[] = [0]

  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') out.push(i + 1)
  }

  return out
}

/**
 * 1-based `line` / `column` for a utf-16 `offset` into the same `source` used
 * to build `lineStarts`. `offset` may equal `source.length` (cursor past last char).
 */
export function offsetToLineColumn(
  lineStarts: readonly number[],
  offset: number,
): { line: number; column: number } {
  if (lineStarts.length === 0) {
    throw new RangeError('lineStarts must contain the offset for line 1')
  }

  let lo = 0
  let hi = lineStarts.length - 1

  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (lineStarts[mid]! <= offset) lo = mid
    else hi = mid - 1
  }

  const line = lo + 1
  const column = offset - lineStarts[lo]! + 1

  return { line, column }
}
