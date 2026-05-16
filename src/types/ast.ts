import type { SourceSpan } from 'src/types/tokens.js'

/**
 * abstract syntax tree (ast) node types for vemi.
 *
 * the ast represents the structured form of parsed content.
 * it is divided into block-level nodes (structural elements)
 * and inline-level nodes (formatting within blocks).
 * spans on nodes support error reporting, syntax highlighting, and source maps.
 */

/**
 * base node structure with source span information.
 */
export type BaseNode<T extends string> = {
  type: T
  span: SourceSpan
}

/**
 * block-level nodes represent structural elements that span
 * one or more lines (headings, paragraphs, code blocks, etc.)
 */
export type BlockNode =
  | Paragraph
  | Heading
  | CodeBlock
  | List
  | OrderedList
  | Blockquote
  | BlankLine

/**
 * blank line (separator); useful for round-trip and editor layout.
 */
export type BlankLine = BaseNode<'blankLine'>

/**
 * inline-level nodes represent formatting and links within
 * block content (emphasis, bold, code, links, etc.)
 */
export type InlineNode = Text | Emphasis | Strong | Code | Link

/**
 * root of inline content (e.g. parser output for a paragraph).
 */
export type InlineRoot = BaseNode<'inlineRoot'> & {
  children: InlineNode[]
}

/**
 * root node containing all top-level block nodes.
 */
export type Root = BaseNode<'root'> & {
  children: BlockNode[]
}

/**
 * paragraph block containing inline content.
 */
export type Paragraph = BaseNode<'paragraph'> & {
  children: InlineNode[]
}

/**
 * heading block with a level (1-6) and inline content.
 */
export type Heading = BaseNode<'heading'> & {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineNode[]
}

/**
 * code block with optional language and raw code content.
 */
export type CodeBlock = BaseNode<'codeBlock'> & {
  language: string | undefined
  content: string
}

/**
 * unordered list containing list items.
 */
export type List = BaseNode<'list'> & {
  children: ListItem[]
}

/**
 * ordered list containing list items.
 */
export type OrderedList = BaseNode<'orderedList'> & {
  children: ListItem[]
}

/**
 * list item containing block content.
 */
export type ListItem = BaseNode<'listItem'> & {
  children: BlockNode[]
}

/**
 * blockquote containing block content.
 */
export type Blockquote = BaseNode<'blockquote'> & {
  children: BlockNode[]
}

/**
 * plain text inline node.
 */
export type Text = BaseNode<'text'> & {
  content: string
}

/**
 * emphasis (italic) inline node.
 */
export type Emphasis = BaseNode<'emphasis'> & {
  children: InlineNode[]
}

/**
 * strong (bold) inline node.
 */
export type Strong = BaseNode<'strong'> & {
  children: InlineNode[]
}

/**
 * inline code node.
 */
export type Code = BaseNode<'code'> & {
  content: string
}

/**
 * link inline node with text and url.
 */
export type Link = BaseNode<'link'> & {
  text: InlineNode[]
  url: string
}
