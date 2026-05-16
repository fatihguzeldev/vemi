/** UTF-16 code-unit offset into a source document. */
export type SourceOffset = number

/** half-open source span: `[start, end)`, measured in UTF-16 code units. */
export type SourceSpan = {
  start: SourceOffset
  end: SourceOffset
}

/** derived source point for diagnostics and human-facing messages. */
export type SourcePosition = {
  line: number
  column: number
  offset: SourceOffset
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
  | EscapedTextToken
  | DelimiterRunToken
  | BacktickRunToken
  | LeftBracketToken
  | RightBracketToken
  | LeftParenToken
  | RightParenToken

/**
 * base token structure with source span information.
 */
export type BaseToken<T extends string> = {
  type: T
  span: SourceSpan
}

/**
 * text line token - represents a line of text content.
 */
export type TextLineToken = BaseToken<'textLine'> & {}

/**
 * blank line token - represents an empty line (separator).
 */
export type BlankLineToken = BaseToken<'blankLine'> & {}

/**
 * heading token - represents a heading marker and level.
 */
export type HeadingToken = BaseToken<'heading'> & {
  level: 1 | 2 | 3 | 4 | 5 | 6
  /** title text after `#` markers and required whitespace. */
  contentSpan: SourceSpan
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
  /** list item text after marker and required whitespace. */
  contentSpan: SourceSpan
}

/**
 * ordered list item token - represents a numbered list item.
 */
export type OrderedListItemToken = BaseToken<'orderedListItem'> & {
  number: number
  /** list item text after `n.` and required whitespace. */
  contentSpan: SourceSpan
}

/**
 * blockquote token - represents a blockquote marker.
 */
export type BlockquoteToken = BaseToken<'blockquote'> & {
  /** quoted text after `>` and optional whitespace. */
  contentSpan: SourceSpan
}

/**
 * plain text token - represents a sequence of characters.
 */
export type TextToken = BaseToken<'text'> & {}

/**
 * escaped text token - a backslash escape whose semantic text is `contentSpan`.
 */
export type EscapedTextToken = BaseToken<'escapedText'> & {
  /** escaped character without the leading backslash. */
  contentSpan: SourceSpan
}

/**
 * delimiter run token - one or more `*` or `_` characters.
 */
export type DelimiterRunToken = BaseToken<'delimiterRun'> & {
  marker: '*' | '_'
  length: number
}

/**
 * backtick run token - one or more `` ` `` characters.
 */
export type BacktickRunToken = BaseToken<'backtickRun'> & {
  length: number
}

/**
 * left bracket token - raw `[` character.
 */
export type LeftBracketToken = BaseToken<'leftBracket'> & {}

/**
 * right bracket token - raw `]` character.
 */
export type RightBracketToken = BaseToken<'rightBracket'> & {}

/**
 * left parenthesis token - raw `(` character.
 */
export type LeftParenToken = BaseToken<'leftParen'> & {}

/**
 * right parenthesis token - raw `)` character.
 */
export type RightParenToken = BaseToken<'rightParen'> & {}
