import { useRef, useState } from 'react'
import type { Item } from '../types/item'
import { CategoryDot } from './CategoryDot'
import { isUrl, openExternal } from '../lib/url'


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
  categoryColor,
  onClick,
  onDelete,
}: {
  item: Item
  categoryColor?: string
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
    <div className="relative">
      <button
        onClick={() => {
          setDragX(0)
          onDelete()
        }}
        aria-label="删除笔记"
        className="absolute inset-y-0 right-0 flex items-center justify-center"
        style={{ width: DELETE_WIDTH }}
      >
        <img
            src="/icons/delete.svg"
            alt="delete"
            className="h-12 w-auto"
        />
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
        className="relative cursor-pointer rounded-md bg-paper p-4 shadow-lg/5 active:bg-accent-soft"
      >
        {/* category and label */}
          <div className="mb-2.5 flex items-center justify-between px-0 py-1">
            <div className="flex items-center gap-1.5 text-xs text-ink font-extrabold ">
              <span> <CategoryDot color={item.category ? categoryColor : undefined} className="h-2 w-2" /></span>                <span> {item.category || '未分类'} </span> 
            </div>
            {item.annotations.length > 0 && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[9px] text-accent-text font-medium">
                {item.annotations.length} 条笔记
              </span>
            )}
          </div>
 
        {/* preview textarea */}
        <div className="mb-2 line-clamp-2 text-xs/6 leading-relaxed text-ink">
        <p>{preview}</p>
        </div>
        {/* source | time  */}
        <div className="flex items-center justify-between mt-2 text-ink-faint font-medium">
          {item.source && (
            isUrl(item.source) ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  openExternal(item.source)
                }}
                className="icon-btn inline-flex items-center gap-1 text-xs hover:text-ink"
              >
                查看来源
               <img src="/icons/link.svg" alt="" className="h-2.5 w-2.5" />

              </button>
            ) : (
              <span className="text-xs">{item.source}</span>
            )
          )}
          <span className="text-[10px]">{formatDate(item.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}