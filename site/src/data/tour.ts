import type {
  CodegenMapping,
  CodegenWalkStep,
  TourAstNode,
  TourAstOutlineNode,
  TourBlockStructure,
  TourBlockToken,
  TourInlineNode,
  TourInlineToken,
} from './types'

export const tourSource = `# Hello Vemi

A tiny compiler for **markdown-like** text.

- Lexer
- Parser
- HTML output

Learn more at [vemi](https://github.com/fatihguzeldev/vemi).`

export const tourSourceLines = tourSource.split('\n')

/** Paragraph zoomed in step 6–8 (line 3, index 2) */
export const zoomLineIndex = 2
export const zoomLineText = 'A tiny compiler for **markdown-like** text.'

export const tourBlockTokens: TourBlockToken[] = [
  { type: 'heading', line: 1, label: 'heading', level: 1, text: 'Hello Vemi' },
  { type: 'blankLine', line: 2, label: 'blankLine' },
  {
    type: 'textLine',
    line: 3,
    label: 'textLine',
    text: 'A tiny compiler for **markdown-like** text.',
  },
  { type: 'blankLine', line: 4, label: 'blankLine' },
  { type: 'listItem', line: 5, label: 'listItem', text: 'Lexer' },
  { type: 'listItem', line: 6, label: 'listItem', text: 'Parser' },
  { type: 'listItem', line: 7, label: 'listItem', text: 'HTML output' },
  { type: 'blankLine', line: 8, label: 'blankLine' },
  {
    type: 'textLine',
    line: 9,
    label: 'textLine',
    text: 'Learn more at [vemi](https://github.com/fatihguzeldev/vemi).',
  },
]

/** Visual block stack for step 5 — document-shaped, not AST tree */
export const tourBlockStructure: TourBlockStructure[] = [
  { kind: 'heading', tag: 'heading', preview: 'Hello Vemi' },
  { kind: 'paragraph', tag: 'paragraph', preview: 'A tiny compiler for **markdown-like** text.' },
  {
    kind: 'list',
    tag: 'list',
    items: ['Lexer', 'Parser', 'HTML output'],
  },
  { kind: 'paragraph', tag: 'paragraph', preview: 'Learn more at [vemi](…).' },
]

export const tourInlineTokens: TourInlineToken[] = [
  { type: 'text', label: 'text', text: 'A tiny compiler for ', start: 0, end: 20 },
  { type: 'delimiterRun', label: 'delimiterRun (**)', text: '**', start: 20, end: 22 },
  { type: 'text', label: 'text', text: 'markdown-like', start: 22, end: 35 },
  { type: 'delimiterRun', label: 'delimiterRun (**)', text: '**', start: 35, end: 37 },
  { type: 'text', label: 'text', text: ' text.', start: 37, end: 43 },
]

export const tourInlineTree: TourInlineNode[] = [
  { type: 'text', label: 'text', text: 'A tiny compiler for ' },
  {
    type: 'strong',
    label: 'strong',
    children: [{ type: 'text', label: 'text', text: 'markdown-like' }],
  },
  { type: 'text', label: 'text', text: ' text.' },
]

export const tourAstOutline: TourAstOutlineNode[] = [
  {
    type: 'heading',
    meta: 'h1',
    children: [{ type: 'text', value: 'Hello Vemi' }],
  },
  {
    type: 'paragraph',
    children: [
      { type: 'text', value: 'A tiny compiler for ' },
      { type: 'strong', children: [{ type: 'text', value: 'markdown-like' }] },
      { type: 'text', value: ' text.' },
    ],
  },
  {
    type: 'list',
    children: [
      { type: 'listItem', value: 'Lexer', shorthand: true },
      { type: 'listItem', value: 'Parser', shorthand: true },
      { type: 'listItem', value: 'HTML output', shorthand: true },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { type: 'text', value: 'Learn more at ' },
      {
        type: 'link',
        meta: 'github.com/fatihguzeldev/vemi',
        children: [{ type: 'text', value: 'vemi' }],
      },
      { type: 'text', value: '.' },
    ],
  },
]

export const tourAst: TourAstNode[] = [
  {
    type: 'root',
    label: 'root',
    children: [
      {
        type: 'heading',
        label: 'heading',
        level: 1,
        children: [{ type: 'text', label: 'text', children: undefined }],
      },
      { type: 'blankLine', label: 'blankLine' },
      {
        type: 'paragraph',
        label: 'paragraph',
        children: [
          { type: 'text', label: 'text' },
          { type: 'strong', label: 'strong', children: [{ type: 'text', label: 'text' }] },
          { type: 'text', label: 'text' },
        ],
      },
      { type: 'blankLine', label: 'blankLine' },
      {
        type: 'list',
        label: 'list',
        children: [
          {
            type: 'listItem',
            label: 'listItem',
            children: [
              {
                type: 'paragraph',
                label: 'paragraph',
                children: [{ type: 'text', label: 'text' }],
              },
            ],
          },
          {
            type: 'listItem',
            label: 'listItem',
            children: [
              {
                type: 'paragraph',
                label: 'paragraph',
                children: [{ type: 'text', label: 'text' }],
              },
            ],
          },
          {
            type: 'listItem',
            label: 'listItem',
            children: [
              {
                type: 'paragraph',
                label: 'paragraph',
                children: [{ type: 'text', label: 'text' }],
              },
            ],
          },
        ],
      },
      { type: 'blankLine', label: 'blankLine' },
      {
        type: 'paragraph',
        label: 'paragraph',
        children: [
          { type: 'text', label: 'text' },
          {
            type: 'link',
            label: 'link',
            url: 'https://github.com/fatihguzeldev/vemi',
            children: [{ type: 'text', label: 'text' }],
          },
          { type: 'text', label: 'text' },
        ],
      },
    ],
  },
]

export const tourAstLabels: Record<string, string> = {
  'heading (h1)': 'Hello Vemi',
  'text (×3 in p1)': 'A tiny compiler for / markdown-like / text.',
  'listItem ×3': 'Lexer, Parser, HTML output',
  link: 'vemi → github.com/.../vemi',
}

export const tourCodegenWalk: CodegenWalkStep[] = [
  {
    node: 'heading · h1',
    pattern: '"<h1>" + render(children) + "</h1>"',
    html: '<h1>Hello Vemi</h1>',
  },
  {
    node: 'paragraph',
    pattern: '"<p>" + render(children) + "</p>"',
    detail: 'children: text · strong · text',
    html: '<p>A tiny compiler for <strong>markdown-like</strong> text.</p>',
  },
  {
    node: 'list',
    pattern: '"<ul>" + render(listItems) + "</ul>"',
    detail: 'each listItem → paragraph → text',
    html: '<ul><li>Lexer</li><li>Parser</li><li>HTML output</li></ul>',
  },
  {
    node: 'paragraph',
    pattern: '"<p>" + render(children) + "</p>"',
    detail: 'children: text · link · text',
    html: '<p>Learn more at <a href="https://github.com/fatihguzeldev/vemi">vemi</a>.</p>',
  },
]

export const tourCodegenMappings: CodegenMapping[] = [
  { astLabel: 'heading', html: '<h1>Hello Vemi</h1>' },
  {
    astLabel: 'paragraph + strong',
    html: '<p>A tiny compiler for <strong>markdown-like</strong> text.</p>',
  },
  {
    astLabel: 'list',
    html: '<ul><li>Lexer</li><li>Parser</li><li>HTML output</li></ul>',
  },
  {
    astLabel: 'link',
    html: '<a href="https://github.com/fatihguzeldev/vemi">vemi</a>',
  },
]

export const tourHtml = `<h1>Hello Vemi</h1><p>A tiny compiler for <strong>markdown-like</strong> text.</p><ul><li>Lexer</li><li>Parser</li><li>HTML output</li></ul><p>Learn more at <a href="https://github.com/fatihguzeldev/vemi">vemi</a>.</p>`

export const tourHtmlFormatted = `<h1>Hello Vemi</h1>
<p>A tiny compiler for <strong>markdown-like</strong> text.</p>
<ul>
  <li>Lexer</li>
  <li>Parser</li>
  <li>HTML output</li>
</ul>
<p>Learn more at <a href="https://github.com/fatihguzeldev/vemi">vemi</a>.</p>`

export const pipelineStages = ['Source', 'Lex', 'Parse', 'AST', 'HTML'] as const
