import { SourceContext } from 'src/frontend/source-context.js'
import { BlockLexer } from 'src/frontend/lexer/block-lexer.js'
import { BlockParser } from 'src/frontend/parser/block-parser.js'
import type { Root } from 'src/types/ast.js'

export function parseDocument(source: string): Root {
  const context = new SourceContext(source)
  const tokens = new BlockLexer(context).tokenize()

  return new BlockParser(tokens, context).parse()
}
