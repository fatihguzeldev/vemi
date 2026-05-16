import { InlineLexer } from 'src/frontend/lexer/inline-lexer.js'
import { InlineParser } from 'src/frontend/parser/inline-parser.js'
import type { InlineNode } from 'src/types/ast.js'
import type { SourceContext } from 'src/frontend/source-context.js'
import type { SourceSpan } from 'src/types/tokens.js'

/**
 * lex + parse a prose span into inline AST nodes.
 *
 * @param context — per-document source context
 * @param sourceSpan — utf-16 span to parse
 */
export function parseInlineChildren(context: SourceContext, sourceSpan: SourceSpan): InlineNode[] {
  const tokens = new InlineLexer(context, sourceSpan).tokenize()

  return new InlineParser(tokens, context, sourceSpan).parse().children
}
