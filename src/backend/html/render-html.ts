import { parseDocument } from 'src/frontend/parser/parse-document.js'
import type {
  BlockNode,
  CodeBlock,
  Heading,
  InlineNode,
  Link,
  ListItem,
  Paragraph,
  Root,
} from 'src/types/ast.js'

export type HtmlRootOptions = {
  tag?: 'article' | 'div' | 'main' | 'section'
  className?: string
}

export type HtmlRenderOptions = {
  classPrefix?: string
  headingIds?: boolean
  root?: HtmlRootOptions
}

type RenderContext = {
  options: HtmlRenderOptions
  headingIds: Map<string, number>
}

export function compileHtml(source: string, options: HtmlRenderOptions = {}): string {
  return renderHtml(parseDocument(source), options)
}

export function renderHtml(root: Root, options: HtmlRenderOptions = {}): string {
  const context: RenderContext = {
    options,
    headingIds: new Map<string, number>(),
  }
  const html = renderBlocks(root.children, context)

  if (!options.root) return html

  const tag = options.root.tag ?? 'article'
  const attributes = attrs([classAttr([prefixedClass(options, 'root'), options.root.className])])

  return `<${tag}${attributes}>${html}</${tag}>`
}

function renderBlocks(nodes: BlockNode[], context: RenderContext): string {
  return nodes.map((node) => renderBlock(node, context)).join('')
}

function renderBlock(node: BlockNode, context: RenderContext): string {
  switch (node.type) {
    case 'paragraph':
      return renderParagraph(node, context)
    case 'heading':
      return renderHeading(node, context)
    case 'codeBlock':
      return renderCodeBlock(node, context)
    case 'list':
      return `<ul${nodeClass(context.options, 'list')}>${node.children.map((item) => renderListItem(item, context)).join('')}</ul>`
    case 'orderedList':
      return `<ol${nodeClass(context.options, 'ordered-list')}>${node.children.map((item) => renderListItem(item, context)).join('')}</ol>`
    case 'blockquote':
      return `<blockquote${nodeClass(context.options, 'blockquote')}>${renderBlocks(node.children, context)}</blockquote>`
    case 'blankLine':
      return ''
  }
}

function renderParagraph(node: Paragraph, context: RenderContext): string {
  return `<p${nodeClass(context.options, 'paragraph')}>${renderInlines(node.children, context)}</p>`
}

function renderHeading(node: Heading, context: RenderContext): string {
  const tag = `h${node.level}`
  const content = renderInlines(node.children, context)
  const id = context.options.headingIds
    ? nextHeadingId(plainText(node.children), context)
    : undefined
  const attributes = attrs([
    attr('id', id),
    classAttr([
      prefixedClass(context.options, 'heading'),
      prefixedClass(context.options, `h${node.level}`),
    ]),
  ])

  return `<${tag}${attributes}>${content}</${tag}>`
}

function renderCodeBlock(node: CodeBlock, context: RenderContext): string {
  const languageClass = node.language ? `language-${node.language}` : undefined
  const codeAttributes = attrs([classAttr([languageClass])])

  return `<pre${nodeClass(context.options, 'code-block')}><code${codeAttributes}>${escapeHtml(node.content)}</code></pre>`
}

function renderListItem(node: ListItem, context: RenderContext): string {
  const onlyChild = node.children.length === 1 ? node.children[0] : undefined
  const content =
    onlyChild?.type === 'paragraph'
      ? renderInlines(onlyChild.children, context)
      : renderBlocks(node.children, context)

  return `<li${nodeClass(context.options, 'list-item')}>${content}</li>`
}

function renderInlines(nodes: InlineNode[], context: RenderContext): string {
  return nodes.map((node) => renderInline(node, context)).join('')
}

function renderInline(node: InlineNode, context: RenderContext): string {
  switch (node.type) {
    case 'text':
      return escapeHtml(node.content)
    case 'emphasis':
      return `<em${nodeClass(context.options, 'emphasis')}>${renderInlines(node.children, context)}</em>`
    case 'strong':
      return `<strong${nodeClass(context.options, 'strong')}>${renderInlines(node.children, context)}</strong>`
    case 'code':
      return `<code${nodeClass(context.options, 'code')}>${escapeHtml(node.content)}</code>`
    case 'link':
      return renderLink(node, context)
  }
}

function renderLink(node: Link, context: RenderContext): string {
  const safeHref = safeUrl(node.url)
  const attributes = attrs([
    attr('href', safeHref),
    classAttr([prefixedClass(context.options, 'link')]),
  ])

  return `<a${attributes}>${renderInlines(node.text, context)}</a>`
}

function plainText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'code':
          return node.content
        case 'emphasis':
        case 'strong':
          return plainText(node.children)
        case 'link':
          return plainText(node.text)
      }
    })
    .join('')
}

function nextHeadingId(value: string, context: RenderContext): string {
  const base = slug(value) || 'section'
  const count = context.headingIds.get(base) ?? 0
  context.headingIds.set(base, count + 1)

  return count === 0 ? base : `${base}-${count}`
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function safeUrl(value: string): string | undefined {
  const trimmed = value.trim()

  if (trimmed === '') return ''
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed
  if (/^(#|\/|\.\/|\.\.\/|\?)/.test(trimmed)) return trimmed
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed

  return undefined
}

function nodeClass(options: HtmlRenderOptions, name: string): string {
  return attrs([classAttr([prefixedClass(options, name)])])
}

function prefixedClass(options: HtmlRenderOptions, name: string): string | undefined {
  return options.classPrefix ? `${options.classPrefix}-${name}` : undefined
}

function attrs(values: Array<string | undefined>): string {
  const joined = values
    .filter((value): value is string => value !== undefined && value !== '')
    .join(' ')

  return joined === '' ? '' : ` ${joined}`
}

function attr(name: string, value: string | undefined): string | undefined {
  return value === undefined ? undefined : `${name}="${escapeAttribute(value)}"`
}

function classAttr(values: Array<string | undefined>): string | undefined {
  const classes = values.filter((value): value is string => value !== undefined && value !== '')

  return classes.length === 0 ? undefined : attr('class', classes.join(' '))
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;')
}
