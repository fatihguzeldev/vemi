# vemi

[![npm version](https://img.shields.io/npm/v/@fatihguzeldev/vemi.svg)](https://www.npmjs.com/package/@fatihguzeldev/vemi)
[![license: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A small compiler for markdown-like text.

Plain text in, HTML out. [vemi.fatihguzel.dev](https://vemi.fatihguzel.dev) is a mini lecture on what happens in between.

Early release. Syntax and public API may change.

## Install

```bash
npm install @fatihguzeldev/vemi
```

Node 18+. ESM only. TypeScript types are included.

## Quick start

```ts
import { compileHtml } from '@fatihguzeldev/vemi'

const html = compileHtml('# Hello **world**')
// <h1>Hello <strong>world</strong></h1>
```

## Supported syntax

Vemi uses a small, explicit grammar.

**Block**

- ATX headings (`#` through `######`)
- paragraphs (blank line separates blocks)
- fenced code blocks
- unordered lists (`-`)
- ordered lists (`1.`)
- blockquotes (`>`)

**Inline**

- emphasis (`*...*` or `_..._`)
- strong (`**...**` or `__...__`)
- inline code (`` `...` ``)
- links (`[text](url)`)

## HTML output

Default output is semantic HTML with safety defaults:

- text, attributes, and code blocks are escaped
- unsafe link URLs (for example `javascript:`) are stripped
- output is a fragment unless you pass a root wrapper
- CSS classes and heading `id` attributes are opt-in

```ts
import { compileHtml } from '@fatihguzeldev/vemi'

const html = compileHtml('## Install\n\n## Install', {
  headingIds: true,
  classPrefix: 'vemi',
  root: { tag: 'article', className: 'prose' },
})

// <article class="vemi-root prose">
//   <h2 id="install" class="vemi-heading vemi-h2">Install</h2>
//   <h2 id="install-1" class="vemi-heading vemi-h2">Install</h2>
// </article>
```

Heading ids are ASCII-only (`install`, `hello-world`). Non-ASCII titles fall back to `section`, `section-1`, and so on.

## API

- `compileHtml(source, options?)` compile source to HTML
- `parseDocument(source)` parse source to AST
- `renderHtml(ast, options?)` render an AST to HTML
- `ParseError` parse error with source position

Exported types: `Root`, `BlockNode`, `InlineNode`, `HtmlRenderOptions`, `HtmlRootOptions`, `SourceSpan`, `SourcePosition`.

### Parse and render separately

```ts
import { parseDocument, renderHtml } from '@fatihguzeldev/vemi'

const ast = parseDocument('Hello *world*')
const html = renderHtml(ast)
// <p>Hello <em>world</em></p>
```

Use `compileHtml` to compile in one step. Use `parseDocument` when you need the AST for inspection, transforms, or another target format later.

## Contributing

Contributions are welcome. Bug fixes, tests, docs, grammar edge cases, and improvements to the [mini lecture](https://vemi.fatihguzel.dev) site are all fair game.

```bash
git clone https://github.com/fatihguzeldev/vemi.git
cd vemi
npm install
npm test
```

For the interactive site:

```bash
npm run dev:site
npm run build:site
```

Open an issue if you want to discuss a bigger change first. Pull requests are appreciated. Use [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.). Run `npm test` and `npm run lint` before submitting.

Early release means APIs and syntax may still move. If your change affects public behavior, add or update tests in `src/__tests__/`.

## License

ISC
