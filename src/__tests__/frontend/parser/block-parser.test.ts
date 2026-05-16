import { describe, it, expect } from 'vitest'
import { SourceContext } from 'src/frontend/source-context.js'
import { BlockParser } from 'src/frontend/parser/block-parser.js'
import { parseDocument } from 'src/frontend/parser/parse-document.js'

describe('BlockParser', () => {
  describe('root and empty input', () => {
    it('returns root with empty children when there are no tokens', () => {
      const ast = parseDocument('')
      expect(ast.type).toBe('root')
      expect(ast.children).toEqual([])
      expect(ast.span).toEqual({ start: 0, end: 0 })
    })

    it('uses first and last token spans as root span when present', () => {
      const ast = parseDocument('hello')
      expect(ast.span).toEqual({ start: 0, end: 5 })
    })
  })

  describe('paragraphs and plain text', () => {
    it('parses a single text line as paragraph with one text child', () => {
      const ast = parseDocument('hello world')
      expect(ast.children).toHaveLength(1)
      const p = ast.children[0]!
      expect(p.type).toBe('paragraph')
      if (p.type === 'paragraph') {
        expect(p.span).toEqual({ start: 0, end: 11 })
        expect(p.children).toHaveLength(1)
        expect(p.children[0]).toMatchObject({
          type: 'text',
          content: 'hello world',
        })
      }
    })

    it('joins consecutive text lines with newline and parses as one inline span', () => {
      const ast = parseDocument('line one\nline two')
      expect(ast.children).toHaveLength(1)
      const p = ast.children[0]!
      expect(p.type).toBe('paragraph')
      if (p.type === 'paragraph') {
        expect(p.children).toHaveLength(1)
        expect(p.children[0]).toMatchObject({
          type: 'text',
          content: 'line one\nline two',
        })
      }
    })

    it('splits paragraphs on blank lines', () => {
      const ast = parseDocument('first\n\nsecond')
      expect(ast.children).toHaveLength(3)
      expect(ast.children[0]!.type).toBe('paragraph')
      expect(ast.children[1]!.type).toBe('blankLine')
      expect(ast.children[2]!.type).toBe('paragraph')
      const first = ast.children[0]!
      const second = ast.children[2]!
      if (first.type === 'paragraph' && second.type === 'paragraph') {
        expect(first.children[0]).toMatchObject({ type: 'text', content: 'first' })
        expect(second.children[0]).toMatchObject({ type: 'text', content: 'second' })
      }
    })
  })

  describe('blank lines', () => {
    it('emits blankLine node for empty line between content', () => {
      const ast = parseDocument('a\n\nb')
      const blank = ast.children.find((n) => n.type === 'blankLine')
      expect(blank).toMatchObject({ type: 'blankLine' })
    })
  })

  describe('headings', () => {
    it('parses ATX heading level and runs inline parse on title', () => {
      const ast = parseDocument('# **Title**')
      expect(ast.children).toHaveLength(1)
      const h = ast.children[0]!
      expect(h.type).toBe('heading')
      if (h.type === 'heading') {
        expect(h.level).toBe(1)
        expect(h.span).toEqual({ start: 0, end: 11 })
        expect(h.children).toHaveLength(1)
        expect(h.children[0]!.type).toBe('strong')
        if (h.children[0]!.type === 'strong') {
          expect(h.children[0]!.children[0]!).toMatchObject({
            type: 'text',
            content: 'Title',
          })
        }
      }
    })

    it('supports heading levels 2 through 6', () => {
      for (let level = 2; level <= 6; level++) {
        const hashes = '#'.repeat(level)
        const ast = parseDocument(`${hashes} H`)
        const h = ast.children[0]!
        expect(h.type).toBe('heading')
        if (h.type === 'heading') {
          expect(h.level).toBe(level as 2 | 3 | 4 | 5 | 6)
          expect(h.children[0]!).toMatchObject({ type: 'text', content: 'H' })
        }
      }
    })

    it('parses links inside heading text', () => {
      const ast = parseDocument('# [doc](https://x.test)')
      const h = ast.children[0]!
      expect(h.type).toBe('heading')
      if (h.type === 'heading') {
        expect(h.children[0]!.type).toBe('link')
        if (h.children[0]!.type === 'link') {
          expect(h.children[0]!.url).toBe('https://x.test')
        }
      }
    })
  })

  describe('fenced code blocks', () => {
    it('does not apply inline parsing to code block body', () => {
      const source = '```\n**not** bold\n```'
      const ast = parseDocument(source)
      expect(ast.children).toHaveLength(1)
      const block = ast.children[0]!
      expect(block.type).toBe('codeBlock')
      if (block.type === 'codeBlock') {
        expect(block.content).toBe('**not** bold')
        expect(block.language).toBeUndefined()
      }
    })

    it('captures language and multiple content lines', () => {
      const source = '```ts\nconst a = 1\nconst b = 2\n```'
      const ast = parseDocument(source)
      const block = ast.children[0]!
      expect(block.type).toBe('codeBlock')
      if (block.type === 'codeBlock') {
        expect(block.language).toBe('ts')
        expect(block.content).toBe('const a = 1\nconst b = 2')
      }
    })

    it('allows prose after a closed code block', () => {
      const source = '```\nx\n```\nhello'
      const ast = parseDocument(source)
      expect(ast.children).toHaveLength(2)
      expect(ast.children[0]!.type).toBe('codeBlock')
      expect(ast.children[1]!.type).toBe('paragraph')
    })
  })

  describe('unordered lists', () => {
    it('groups adjacent list items into one list', () => {
      const ast = parseDocument('- a\n- b')
      expect(ast.children).toHaveLength(1)
      const list = ast.children[0]!
      expect(list.type).toBe('list')
      if (list.type === 'list') {
        expect(list.children).toHaveLength(2)
        expect(list.children[0]!.type).toBe('listItem')
        expect(list.children[1]!.type).toBe('listItem')
      }
    })

    it('parses inline markdown inside list item text', () => {
      const ast = parseDocument('- **bold** item')
      const list = ast.children[0]!
      expect(list.type).toBe('list')
      if (list.type === 'list') {
        const item = list.children[0]!
        expect(item.type).toBe('listItem')
        if (item.type === 'listItem') {
          const para = item.children[0]!
          expect(para.type).toBe('paragraph')
          if (para.type === 'paragraph') {
            expect(para.children[0]!.type).toBe('strong')
          }
        }
      }
    })

    it('uses empty inline children for empty list item content after marker', () => {
      const ast = parseDocument('- ')
      const list = ast.children[0]!
      expect(list.type).toBe('list')
      if (list.type === 'list') {
        const para = list.children[0]!.children[0]!
        expect(para.type).toBe('paragraph')
        if (para.type === 'paragraph') {
          expect(para.children).toEqual([])
        }
      }
    })
  })

  describe('ordered lists', () => {
    it('groups adjacent ordered items', () => {
      const ast = parseDocument('1. first\n2. second')
      expect(ast.children).toHaveLength(1)
      const list = ast.children[0]!
      expect(list.type).toBe('orderedList')
      if (list.type === 'orderedList') {
        expect(list.children).toHaveLength(2)
      }
    })

    it('parses inline inside ordered list item', () => {
      const ast = parseDocument('1. *em*')
      const list = ast.children[0]!
      expect(list.type).toBe('orderedList')
      if (list.type === 'orderedList') {
        const para = list.children[0]!.children[0]!
        expect(para.type).toBe('paragraph')
        if (para.type === 'paragraph') {
          expect(para.children[0]!.type).toBe('emphasis')
        }
      }
    })
  })

  describe('blockquotes', () => {
    it('merges consecutive blockquote lines into one blockquote with multiple paragraphs', () => {
      const ast = parseDocument('> line1\n> line2')
      expect(ast.children).toHaveLength(1)
      const bq = ast.children[0]!
      expect(bq.type).toBe('blockquote')
      if (bq.type === 'blockquote') {
        expect(bq.children).toHaveLength(2)
        expect(bq.children[0]!.type).toBe('paragraph')
        expect(bq.children[1]!.type).toBe('paragraph')
      }
    })

    it('parses inline inside each blockquote paragraph', () => {
      const ast = parseDocument('> `code` here')
      const bq = ast.children[0]!
      expect(bq.type).toBe('blockquote')
      if (bq.type === 'blockquote') {
        const para = bq.children[0]!
        expect(para.type).toBe('paragraph')
        if (para.type === 'paragraph') {
          expect(para.children).toHaveLength(2)
          expect(para.children[0]).toMatchObject({ type: 'code', content: 'code' })
          expect(para.children[1]).toMatchObject({ type: 'text', content: ' here' })
        }
      }
    })
  })

  describe('mixed document shape', () => {
    it('parses heading, blank, paragraph with inline, then list', () => {
      const source = '# Intro\n\nHello **world**.\n\n- one\n- two'
      const ast = parseDocument(source)
      expect(ast.children.length).toBeGreaterThanOrEqual(4)
      expect(ast.children[0]!.type).toBe('heading')
      expect(ast.children[1]!.type).toBe('blankLine')
      expect(ast.children[2]!.type).toBe('paragraph')
      const para = ast.children[2]!
      if (para.type === 'paragraph') {
        const strong = para.children.find((n) => n.type === 'strong')
        expect(strong).toBeDefined()
      }
      expect(ast.children[3]!.type).toBe('blankLine')
      expect(ast.children[4]!.type).toBe('list')
    })
  })

  describe('inline vs block ordering', () => {
    it('prefers code block over paragraph when fence starts a line', () => {
      const ast = parseDocument('```\nx\n```')
      expect(ast.children[0]!.type).toBe('codeBlock')
    })

    it('prefers heading over paragraph when line starts with #', () => {
      const ast = parseDocument('# not a paragraph marker test')
      expect(ast.children[0]!.type).toBe('heading')
    })
  })

  describe('list and paragraph boundaries', () => {
    it('starts a new list after a paragraph without requiring a blank line', () => {
      const ast = parseDocument('intro\n- item')
      expect(ast.children).toHaveLength(2)
      expect(ast.children[0]!.type).toBe('paragraph')
      expect(ast.children[1]!.type).toBe('list')
    })

    it('ends a list when a non-list line appears', () => {
      const ast = parseDocument('- a\nplain')
      expect(ast.children).toHaveLength(2)
      expect(ast.children[0]!.type).toBe('list')
      expect(ast.children[1]!.type).toBe('paragraph')
      const para = ast.children[1]!
      if (para.type === 'paragraph') {
        expect(para.children[0]).toMatchObject({ type: 'text', content: 'plain' })
      }
    })
  })

  describe('direct BlockParser (hand-built tokens)', () => {
    it('parses a minimal token stream without using BlockLexer', () => {
      const fullSource = 'only line'
      const context = new SourceContext(fullSource)
      const tokens = [
        {
          type: 'textLine' as const,
          span: { start: 0, end: 9 },
        },
      ]
      const ast = new BlockParser(tokens, context).parse()
      expect(ast.type).toBe('root')
      expect(ast.span).toEqual({ start: 0, end: 9 })
      const p = ast.children[0]!
      expect(p.type).toBe('paragraph')
      if (p.type === 'paragraph') {
        expect(p.span).toEqual({ start: 0, end: 9 })
        expect(p.children[0]).toMatchObject({ type: 'text', content: 'only line' })
      }
    })
  })
})
