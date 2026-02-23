/**
 * source position for error reporting and syntax highlighting
 */
export type SourcePosition = {
  line: number
  column: number
}

/**
 * token types for vemi lexers.
 *
 * tokens are the intermediate representation produced by lexers
 * before parsing into ast nodes. they represent the raw syntactic
 * elements found in the source text.
 */

/**
 * block-level tokens represent structural elements detected
 * at the line level (paragraphs, headings, code blocks, etc.)
 */
export type BlockToken =
  | TextLineToken
  | BlankLineToken
  | HeadingToken
  | CodeBlockStartToken
  | CodeBlockContentToken
  | CodeBlockEndToken
  | ListItemToken
  | OrderedListItemToken
  | BlockquoteToken

/**
 * inline-level tokens represent formatting elements detected
 * within text (emphasis markers, links, code spans, etc.)
 */
export type InlineToken =
  | TextToken
  | EmphasisStartToken
  | EmphasisEndToken
  | StrongStartToken
  | StrongEndToken
  | CodeStartToken
  | CodeEndToken
  | LinkStartToken
  | LinkTextEndToken
  | LinkUrlToken
  | LinkEndToken

/**
 * base token structure with position information.
 */
export type BaseToken<T extends string> = {
  type: T
  position: SourcePosition
}

/**
 * text line token - represents a line of text content.
 */
export type TextLineToken = BaseToken<'textLine'> & {
  content: string
}

/**
 * blank line token - represents an empty line (separator).
 */
export type BlankLineToken = BaseToken<'blankLine'> & {}

/**
 * heading token - represents a heading marker and level.
 */
export type HeadingToken = BaseToken<'heading'> & {
  level: 1 | 2 | 3 | 4 | 5 | 6
  content: string
}

/**
 * code block start token - marks the beginning of a fenced code block.
 */
export type CodeBlockStartToken = BaseToken<'codeBlockStart'> & {
  language: string | undefined
  fence: string // the fence characters used (``` or ~~~)
}

/**
 * code block content token - one line of content between codeBlockStart and codeBlockEnd.
 * used for syntax highlighting, line numbers, and building the code block node.
 */
export type CodeBlockContentToken = BaseToken<'codeBlockContent'> & {
  content: string
  lineInBlock: number
}

/**
 * code block end token - marks the end of a fenced code block.
 */
export type CodeBlockEndToken = BaseToken<'codeBlockEnd'> & {
  fence: string
}

/**
 * list item token - represents an unordered list item marker.
 */
export type ListItemToken = BaseToken<'listItem'> & {
  marker: string // the marker used (-, *, +)
  content: string
}

/**
 * ordered list item token - represents a numbered list item.
 */
export type OrderedListItemToken = BaseToken<'orderedListItem'> & {
  number: number
  content: string
}

/**
 * blockquote token - represents a blockquote marker.
 */
export type BlockquoteToken = BaseToken<'blockquote'> & {
  content: string
}

/**
 * plain text token - represents a sequence of characters.
 */
export type TextToken = BaseToken<'text'> & {
  content: string
}

/**
 * emphasis start token - marks the beginning of italic text.
 */
export type EmphasisStartToken = BaseToken<'emphasisStart'> & {
  marker: string // * or _
}

/**
 * emphasis end token - marks the end of italic text.
 */
export type EmphasisEndToken = BaseToken<'emphasisEnd'> & {
  marker: string
}

/**
 * strong start token - marks the beginning of bold text.
 */
export type StrongStartToken = BaseToken<'strongStart'> & {
  marker: string // ** or __
}

/**
 * strong end token - marks the end of bold text.
 */
export type StrongEndToken = BaseToken<'strongEnd'> & {
  marker: string
}

/**
 * code start token - marks the beginning of inline code.
 */
export type CodeStartToken = BaseToken<'codeStart'> & {
  marker: string // `
}

/**
 * code end token - marks the end of inline code.
 */
export type CodeEndToken = BaseToken<'codeEnd'> & {
  marker: string
}

/**
 * link start token - marks the beginning of a link (`[`).
 */
export type LinkStartToken = BaseToken<'linkStart'> & {}

/**
 * link text end token - marks the end of link text (`]`).
 */
export type LinkTextEndToken = BaseToken<'linkTextEnd'> & {}

/**
 * link url token - contains the url portion of a link.
 */
export type LinkUrlToken = BaseToken<'linkUrl'> & {
  url: string
}

/**
 * link end token - marks the end of a link (`)`).
 */
export type LinkEndToken = BaseToken<'linkEnd'> & {}
