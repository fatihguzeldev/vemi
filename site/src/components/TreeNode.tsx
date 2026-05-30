import type { TourAstNode, TourBlockNode, TourInlineNode } from '../data/types'
import { useReducedMotion } from '../hooks/useReducedMotion'

type TreeNodeProps = {
  node: TourBlockNode | TourInlineNode | TourAstNode
  depth?: number
  index?: number
  animate?: boolean
  compact?: boolean
}

export function TreeNode({ node, depth = 0, index = 0, animate = true, compact = false }: TreeNodeProps) {
  const reduced = useReducedMotion()
  const delay = reduced || !animate ? '' : `stagger-${Math.min(index + depth + 1, 10)}`
  const hasChildren = node.children && node.children.length > 0

  return (
    <div class={`tree-node ${animate && !reduced ? `animate-fade-in ${delay}` : ''}`}>
      <div class="tree-node__row" style={{ paddingLeft: `${depth * (compact ? 12 : 20)}px` }}>
        <span class="tree-node__type">{node.label}</span>
        {'url' in node && node.url && (
          <span class="tree-node__meta">{node.url.replace('https://', '')}</span>
        )}
        {'level' in node && node.level !== undefined && (
          <span class="tree-node__meta">level {node.level}</span>
        )}
      </div>
      {hasChildren && (
        <div class="tree-node__children">
          {node.children!.map((child, i) => (
            <TreeNode
              key={`${child.label}-${i}`}
              node={child}
              depth={depth + 1}
              index={i}
              animate={animate}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  )
}
