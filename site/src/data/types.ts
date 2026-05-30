export type Locale = 'en' | 'tr'

export type BlockTokenType =
  | 'heading'
  | 'blankLine'
  | 'textLine'
  | 'listItem'
  | 'orderedListItem'
  | 'codeBlockStart'
  | 'codeBlockContent'
  | 'codeBlockEnd'
  | 'blockquote'

export type InlineTokenType =
  | 'text'
  | 'delimiterRun'
  | 'backtickRun'
  | 'leftBracket'
  | 'rightBracket'
  | 'leftParen'
  | 'rightParen'

export type AstNodeType =
  | 'root'
  | 'heading'
  | 'paragraph'
  | 'blankLine'
  | 'list'
  | 'orderedList'
  | 'listItem'
  | 'blockquote'
  | 'codeBlock'
  | 'text'
  | 'emphasis'
  | 'strong'
  | 'code'
  | 'link'

export type TourBlockToken = {
  type: BlockTokenType
  line: number
  label: string
  text?: string
  level?: number
}

export type TourInlineToken = {
  type: InlineTokenType
  label: string
  text: string
  start: number
  end: number
}

export type TourBlockNode = {
  type: AstNodeType
  label: string
  children?: TourBlockNode[]
  level?: number
}

export type TourInlineNode = {
  type: AstNodeType
  label: string
  text?: string
  url?: string
  children?: TourInlineNode[]
}

export type TourAstNode = {
  type: AstNodeType
  label: string
  level?: number
  url?: string
  children?: TourAstNode[]
}

export type TourBlockStructure = {
  kind: 'heading' | 'paragraph' | 'list'
  tag: string
  preview?: string
  items?: string[]
}

export type TourAstOutlineNode = {
  type: string
  meta?: string
  value?: string
  shorthand?: boolean
  children?: TourAstOutlineNode[]
}

export type CodegenMapping = {
  astLabel: string
  html: string
}

export type CodegenWalkStep = {
  node: string
  pattern: string
  detail?: string
  html: string
}
