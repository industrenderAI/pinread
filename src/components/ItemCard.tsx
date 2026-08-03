import { useRef, useState } from 'react'
import type { Item } from '../types/item'

const DELETE_WIDTH = 76
const OPEN_THRESHOLD = 40

function formatDate(ts: number) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`
}

export function ItemCard({
  item,
  onClick,
  onDelete,
}: {
  item: Item
  onClick: () => void
  onDelete: () => void
}) {
  const [dragX, setDragX] = useState(0) // 负值：向左滑开
  const dragging = useRef(false)
  const startX = useRef(0)
  const startDragX = useRef(0)
  const moved = useRef(false)

  const preview = item.content.replace(/\n/g, ' ')

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    moved.current = false
    startX.current = e.clientX
    startDragX.current = dragX
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const delta = e.clientX - startX.current
    if (Math.abs(delta) > 4) moved.current = true
    const next = Math.max(-DELETE_WIDTH, Math.min(0, startDragX.current + delta))
    setDragX(next)
  }

  const endDrag = () => {
    if (!dragging.current) return
    dragging.current = false
    setDragX((current) => (current < -OPEN_THRESHOLD ? -DELETE_WIDTH : 0))
  }

  const handleClick = () => {
    if (moved.current) return // 这是一次拖拽，不算点击
    if (dragX < 0) {
      setDragX(0) // 已经滑开了，先收起，不进入详情
      return
    }
    onClick()
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <button
        onClick={() => {
          setDragX(0)
          onDelete()
        }}
        aria-label="删除笔记"
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-danger text-sm text-white"
        style={{ width: DELETE_WIDTH }}
      >
        删除
      </button>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={handleClick}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging.current ? 'none' : 'transform .2s ease',
          touchAction: 'pan-y',
        }}
        className="relative cursor-pointer rounded-xl border border-line bg-paper-card p-4 active:bg-accent-soft"
      >
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-ink">{formatDate(item.updatedAt)}</span>
          <div className="flex items-center gap-1.5 ">
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent-text font-medium">
              {item.category}
            </span>
            {item.annotations.length > 0 && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent-text font-medium">
                {item.annotations.length} 条备注
              </span>
            )}
          </div>
        </div>
        <p className="line-clamp-2 text-[14.5px] leading-relaxed text-ink">{preview}</p>
        {item.source && <p className="mt-2 text-xs text-ink-faint font-medium">{item.source}</p>}
      </div>
    </div>
  )
}
