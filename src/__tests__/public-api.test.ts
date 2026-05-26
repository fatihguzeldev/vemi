import { describe, expect, it } from 'vitest'
import { compileHtml, parseDocument, renderHtml } from 'src/index.js'
import type { Heading } from 'src/types/ast.js'

describe('public api', () => {
  it('parses documents through the package entrypoint', () => {
    const ast = parseDocument('# Hello **world**')

    expect(ast.type).toBe('root')
    expect(ast.children).toHaveLength(1)

    const block = ast.children[0]!
    expect(block.type).toBe('heading')
    const heading = block as Heading
    expect(heading.level).toBe(1)
    expect(heading.children.some((n) => n.type === 'strong')).toBe(true)
  })

  it('renders semantic html from ast', () => {
    const ast = parseDocument('# Hello **world**')

    expect(renderHtml(ast)).toBe('<h1>Hello <strong>world</strong></h1>')
  })

  it('compiles source to semantic html', () => {
    expect(compileHtml('Hello *world*')).toBe('<p>Hello <em>world</em></p>')
  })

  it('escapes text, code, and attributes by default', () => {
    const source = [
      '# <Hello>',
      '',
      'Visit [site](https://example.test?a=1&b="x")',
      '',
      '```html',
      '<script>alert(1)</script>',
      '```',
    ].join('\n')

    expect(compileHtml(source)).toBe(
      [
        '<h1>&lt;Hello&gt;</h1>',
        '<p>Visit <a href="https://example.test?a=1&amp;b=&quot;x&quot;">site</a></p>',
        '<pre><code class="language-html">&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>',
      ].join(''),
    )
  })

  it('strips unsafe link hrefs', () => {
    expect(compileHtml('[x](javascript:alert(1))')).toBe('<p><a>x</a></p>')
  })

  it('supports deterministic optional html hooks', () => {
    const source = ['## Install', '## Install'].join('\n')

    expect(
      compileHtml(source, {
        classPrefix: 'vemi',
        headingIds: true,
        root: { tag: 'article', className: 'prose' },
      }),
    ).toBe(
      '<article class="vemi-root prose">' +
        '<h2 id="install" class="vemi-heading vemi-h2">Install</h2>' +
        '<h2 id="install-1" class="vemi-heading vemi-h2">Install</h2>' +
        '</article>',
    )
  })
})
