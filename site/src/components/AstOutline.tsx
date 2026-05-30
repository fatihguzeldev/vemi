import type { TourAstOutlineNode } from '../data/types'
import { useT } from '../context/LocaleContext'
import { ui } from '../content/ui'
import { useReducedMotion } from '../hooks/useReducedMotion'

const BLOCK_TYPES = new Set(['heading', 'paragraph', 'list', 'listItem', 'root'])

type AstOutlineProps = {
  nodes: TourAstOutlineNode[]
}

function OutlineNode({
  node,
  depth = 0,
  index = 0,
}: {
  node: TourAstOutlineNode
  depth?: number
  index?: number
}) {
  const reduced = useReducedMotion()
  const isBlock = BLOCK_TYPES.has(node.type)
  const hasChildren = node.children && node.children.length > 0
  const delay = reduced ? '' : `stagger-${Math.min(depth + index + 1, 10)}`

  if (node.shorthand && node.value) {
    return (
      <li
        class={`ast-outline__item ${!reduced ? `animate-fade-in ${delay}` : ''}`}
        style={{ '--depth': depth }}
      >
        <div class="ast-outline__row">
          <span class="ast-outline__type">listItem</span>
          <span class="ast-outline__shorthand">paragraph → text</span>
          <span class="ast-outline__value">"{node.value}"</span>
        </div>
      </li>
    )
  }

  return (
    <li
      class={`ast-outline__item ${isBlock ? 'ast-outline__item--block' : ''} ${!reduced ? `animate-fade-in ${delay}` : ''}`}
      style={{ '--depth': depth }}
    >
      <div class="ast-outline__row">
        <span class={`ast-outline__type ${isBlock ? 'ast-outline__type--block' : ''}`}>{node.type}</span>
        {node.meta && <span class="ast-outline__meta">{node.meta}</span>}
        {node.value && !hasChildren && <span class="ast-outline__value">"{node.value}"</span>}
      </div>
      {hasChildren && (
        <ul class="ast-outline__children">
          {node.children!.map((child, i) => (
            <OutlineNode key={`${child.type}-${i}`} node={child} depth={depth + 1} index={i} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function AstOutline({ nodes }: AstOutlineProps) {
  const reduced = useReducedMotion()
  const label = useT(ui.astOutlineLabel)

  return (
    <ul class="ast-outline" aria-label={label}>
      <li class={`ast-outline__item ast-outline__item--root ${!reduced ? 'animate-fade-in' : ''}`}>
        <div class="ast-outline__row">
          <span class="ast-outline__type ast-outline__type--root">root</span>
        </div>
        <ul class="ast-outline__children">
          {nodes.map((node, i) => (
            <OutlineNode key={`${node.type}-${i}`} node={node} depth={1} index={i} />
          ))}
        </ul>
      </li>
    </ul>
  )
}
