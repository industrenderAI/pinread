import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Item } from '../types/item'
import { NoteModal } from './NoteModal'
import { isUrl, openExternal } from '../lib/url'

function getTextOffset(container: Node, node: Node, offset: number): number {
  let total = 0
  let found = -1

  function walk(n: Node) {
    if (found > -1) return
    if (n.nodeType === Node.TEXT_NODE) {
      if (n === node) {
        found = total + offset
        return
      }
      total += (n.textContent ?? '').length
    } else {
      for (let i = 0; i < n.childNodes.length; i++) {
        walk(n.childNodes[i])
        if (found > -1) return
      }
    }
  }
  walk(container)
  return found
}

const FONT_SIZES = [14, 15.5, 16.5, 18, 20.5]
const FONT_LABELS = ['极小', '小', '默认', '大', '最大']

export function ItemDetail({
  item,
  theme,
  onBack,
  onEdit,
  onToggleTheme,
  onAddAnnotation,
  onDeleteAnnotation,
  onEditAnnotation,
}: {
  item: Item
  theme: 'light' | 'dark'
  onBack: () => void
  onEdit: () => void
  onToggleTheme: () => void
  onAddAnnotation: (start: number, end: number, note: string) => void
  onDeleteAnnotation: (annotationId: string) => void
  onEditAnnotation: (annotationId: string, note: string) => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [viewingAnnotation, setViewingAnnotation] = useState<Item['annotations'][number] | null>(
    null,
  )
  const [editingAnnotation, setEditingAnnotation] = useState<Item['annotations'][number] | null>(
    null,
  )
  const [pendingRange, setPendingRange] = useState<{ start: number; end: number; text: string } | null>(
    null,
  )
  const [selectionMenu, setSelectionMenu] = useState<{
    start: number
    end: number
    text: string
    anchorLeft: number
    anchorRight: number
    anchorTop: number
    anchorBottom: number
  } | null>(null)
  const [menuPos, setMenuPos] = useState<{ left: number; top: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [sizePanelOpen, setSizePanelOpen] = useState(false)
  const [fontStep, setFontStep] = useState(2)
  const [annotationsVisible, setAnnotationsVisible] = useState(true)
  const [immersive, setImmersive] = useState(false)
  
  // 记录是否处于交互/拖拽状态（支持 mouse 与 touch）
  const isMouseDownRef = useRef(false)

  useEffect(() => {
    const handler = () => {
      handleSelection()
    }

    document.addEventListener('selectionchange', handler)

    return () => {
      document.removeEventListener('selectionchange', handler)
    }
  }, [])

  // 选中菜单渲染出来后，测量真实尺寸，再把它约束在可视区域内
  useLayoutEffect(() => {
    if (!selectionMenu || !menuRef.current) {
      setMenuPos(null)
      return
    }
    const margin = 8
    const gap = 10
    const menuRect = menuRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const anchorCenterX = (selectionMenu.anchorLeft + selectionMenu.anchorRight) / 2
    let left = anchorCenterX - menuRect.width / 2
    left = Math.max(margin, Math.min(left, vw - menuRect.width - margin))

    let top = selectionMenu.anchorTop - menuRect.height - gap
    if (top < margin) {
      top = selectionMenu.anchorBottom + gap
    }
    top = Math.max(margin, Math.min(top, vh - menuRect.height - margin))

    setMenuPos({ left, top })
  }, [selectionMenu])

  // 点击/触摸菜单以外的地方关闭菜单
  useEffect(() => {
    if (!selectionMenu) return

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSelectionMenu(null)
        window.getSelection()?.removeAllRanges()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [selectionMenu])

  // 统一处理鼠标按压与触屏手势
  useEffect(() => {
    const handleStart = (e: MouseEvent | TouchEvent) => {
      if (contentRef.current?.contains(e.target as Node)) {
        isMouseDownRef.current = true
      }
    }

    const handleEnd = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false
        // 延迟一小段时间以保证移动端原生 Selection 状态更新到位
        setTimeout(() => {
          handleSelection()
        }, 10)
      }
    }

    document.addEventListener('mousedown', handleStart)
    document.addEventListener('touchstart', handleStart, { passive: true })
    
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('touchcancel', handleEnd)

    return () => {
      document.removeEventListener('mousedown', handleStart)
      document.removeEventListener('touchstart', handleStart)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)
      document.removeEventListener('touchcancel', handleEnd)
    }
  }, [])

  const handleSelection = () => {
    // 按住拖拽或调整放大镜手柄中，直接跳过
    if (isMouseDownRef.current) return
    
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return
    const container = contentRef.current
    if (!container) return
    const range = sel.getRangeAt(0)
    if (
      !container.contains(range.startContainer) ||
      !container.contains(range.endContainer)
    ) return
    let start = getTextOffset(container, range.startContainer, range.startOffset)
    let end = getTextOffset(container, range.endContainer, range.endOffset)
    if (start < 0 || end < 0 || start === end) return
    if (start > end) [start, end] = [end, start]

    const text = item.content.slice(start, end)
    const rect = range.getBoundingClientRect()

    setTimeout(() => {
      setSelectionMenu({
        start,
        end,
        text,
        anchorLeft: rect.left,
        anchorRight: rect.right,
        anchorTop: rect.top,
        anchorBottom: rect.bottom,
      })
      sel.removeAllRanges()
    }, 50)
  }

  const closeViewingAnnotation = () => {
    setViewingAnnotation(null)
  }

  const sortedAnns = [...item.annotations].sort((a, b) => a.start - b.start)
  const highlightRange = selectionMenu ? { start: selectionMenu.start, end: selectionMenu.end } : null

  const breakpoints = new Set<number>([0, item.content.length])
  sortedAnns.forEach((a) => {
    breakpoints.add(a.start)
    breakpoints.add(a.end)
  })
  if (highlightRange) {
    breakpoints.add(highlightRange.start)
    breakpoints.add(highlightRange.end)
  }
  const points = [...breakpoints].sort((a, b) => a - b)

  const nodes: React.ReactNode[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i]
    const segEnd = points[i + 1]
    if (segStart >= segEnd) continue
    const text = item.content.slice(segStart, segEnd)
    const ann = sortedAnns.find((a) => a.start <= segStart && a.end >= segEnd)
    const isHighlighted =
      !!highlightRange && highlightRange.start <= segStart && highlightRange.end >= segEnd

    if (ann) {
      nodes.push(
        <span
          key={`ann-${ann.id}-${segStart}`}
          className={`ann ${viewingAnnotation?.id === ann.id ? 'active' : ''} ${
            isHighlighted ? 'bg-accent-soft' : ''
          }`}
          onClick={() => setViewingAnnotation(ann)}
        >
          {text}
        </span>,
      )
    } else if (isHighlighted) {
      nodes.push(
        <span key={`hl-${segStart}`} className="bg-accent-soft">
          {text}
        </span>,
      )
    } else {
      nodes.push(text)
    }
  }

  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-lg flex-col bg-paper">
      <div className={`flex items-center justify-between px-4 py-3.5 ${immersive ? 'hidden' : ''}`}>
        <button onClick={onBack} className="icon-btn">
          <img src="/icons/back.svg" alt="" className="h-4 w-4" />
        </button>
        <button
          onClick={() => setToolbarOpen((v) => !v)}
          aria-label="编辑"
          className={`icon-btn flex h-8 w-8 items-center justify-center rounded-lg ${
            toolbarOpen ? 'bg-accent-soft' : ''
          }`}
        >
          <img src="/icons/edit.svg" alt="" className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-5">
        <div className={annotationsVisible ? '' : 'ann-hidden'}>
          <div
            ref={contentRef}
            style={{ fontSize: FONT_SIZES[fontStep] }}
            className="font-serif-cn whitespace-pre-wrap leading-loose"
          >
            {nodes}
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-3.5 text-xs leading-relaxed text-ink-faint">
          {item.source && (
            isUrl(item.source) ? (
              <button
                type="button"
                onClick={() => openExternal(item.source)}
                className="icon-btn mb-3.5 inline-flex items-center gap-1 text-[13px] text-ink-faint hover:text-ink"
              >
                查看来源
                <img src="/icons/link.svg" alt="Source Link" className="h-2.5 w-2.5" />
              </button>
            ) : (
              <p className="mb-3.5 text-[13px] text-ink-faint">来自：{item.source}</p>
            )
          )}
        </div>
      </div>

      <button
        onClick={() => {
          setImmersive((v) => !v)
          if (!immersive) setToolbarOpen(false)
        }}
        aria-label={immersive ? '退出' : '全屏'}
        className="icon-btn fixed bottom-18 right-5 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-paper-card shadow-lg"
      >
        <img
          src={immersive ? '/icons/fullscreen-exit.svg' : '/icons/fullscreen.svg'}
          alt=""
          className="h-4 w-4"
        />
      </button>

      {toolbarOpen && (
        <div className="border-t border-line bg-paper-card px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5">
          {sizePanelOpen && (
            <div className="mb-1 px-2 pb-3 pt-1">
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={fontStep}
                onChange={(e) => setFontStep(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="mt-1 flex justify-between text-[11px] text-ink-faint">
                {FONT_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-around">
            <button
              onClick={onEdit}
              className="icon-btn flex flex-col items-center gap-1 py-1 text-[11px] text-ink-soft"
            >
              <img src="/icons/edit.svg" alt="" className="h-5 w-5" />
              内容修改
            </button>
            <button
              onClick={() => setSizePanelOpen((v) => !v)}
              className="icon-btn flex flex-col items-center gap-1 py-1 text-[11px] text-ink-soft"
            >
              <img src="/icons/size.svg" alt="" className="h-5 w-5" />
              文字大小
            </button>
            <button
              onClick={onToggleTheme}
              className="icon-btn flex flex-col items-center gap-1 py-1 text-[11px] text-ink-soft"
            >
              <img
                src={theme === 'dark' ? '/icons/night.svg' : '/icons/day.svg'}
                alt=""
                className="h-5 w-5"
              />
              {theme === 'dark' ? '夜间模式' : '日间模式'}
            </button>
            <button
              onClick={() => setAnnotationsVisible((v) => !v)}
              className="icon-btn flex flex-col items-center gap-1 py-1 text-[11px] text-ink-soft"
            >
              <img
                src={annotationsVisible ? '/icons/show.svg' : '/icons/hide.svg'}
                alt=""
                className="h-5 w-5"
              />
              {annotationsVisible ? '显示标注下划线' : '隐藏标注下划线'}
            </button>
          </div>
        </div>
      )}

      {pendingRange && (
        <NoteModal
          quote={pendingRange.text}
          onCancel={() => setPendingRange(null)}
          onSave={(note) => {
            onAddAnnotation(pendingRange.start, pendingRange.end, note)
            setPendingRange(null)
          }}
        />
      )}

      {editingAnnotation && (
        <NoteModal
          quote={item.content.slice(editingAnnotation.start, editingAnnotation.end)}
          initialNote={editingAnnotation.note}
          title="修改笔记"
          onCancel={() => setEditingAnnotation(null)}
          onSave={(note) => {
            onEditAnnotation(editingAnnotation.id, note)
            setEditingAnnotation(null)
          }}
        />
      )}

      {selectionMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 flex items-center gap-5 rounded-xl bg-black px-4 py-3 text-white shadow-xl"
          style={{
            left: menuPos?.left ?? -9999,
            top: menuPos?.top ?? -9999,
            visibility: menuPos ? 'visible' : 'hidden',
          }}
        >
          <button
            onClick={() => {
              setPendingRange({
                start: selectionMenu.start,
                end: selectionMenu.end,
                text: selectionMenu.text,
              })
              window.getSelection()?.removeAllRanges()
              setSelectionMenu(null)
            }}
            className="flex flex-col items-center text-xs"
          >
            笔记
          </button>

          <button
            onClick={() => {
              console.log('AI:', selectionMenu.text)
              window.getSelection()?.removeAllRanges()
            }}
            className="flex flex-col items-center text-xs"
          >
            AI
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(selectionMenu.text)
              window.getSelection()?.removeAllRanges()
              setSelectionMenu(null)
            }}
            className="flex flex-col items-center text-xs"
          >
            复制
          </button>

          <button
            onClick={() => {
              window.getSelection()?.removeAllRanges()
              setSelectionMenu(null)
            }}
            className="flex flex-col items-center text-xs"
          >
            取消
          </button>
        </div>
      )}


      {viewingAnnotation && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 transition-opacity"
          onClick={closeViewingAnnotation}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl bg-paper-card p-5 shadow-2xl transition-transform max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部小拉条 handle，增强底部抽屉视觉感 */}
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink-faint/20 shrink-0" />

            {/* 引用文字区域（如果引用内容太长也可滚动） */}
            <p className="mb-4 max-h-32 overflow-y-auto border-b border-line pb-3 text-sm font-bold text-ink leading-relaxed">
              {item.content.slice(viewingAnnotation.start, viewingAnnotation.end)}
            </p>

            {/* 笔记正文区域：自适应高度 + 超长可滑动 */}
            <div className="flex-1 overflow-y-auto pr-1 font-sans text-sm leading-relaxed text-ink whitespace-pre-wrap">
              {viewingAnnotation.note}
            </div>

            {/* 底部按钮栏 */}
            <div className="mt-6 flex items-center justify-end gap-6 pt-3 border-t border-line/50 shrink-0">
              <button
                onClick={() => {
                  setEditingAnnotation(viewingAnnotation)
                  setViewingAnnotation(null)
                }}
                className="text-sm font-medium text-ink"
              >
                修改
              </button>
              <button
                onClick={() => {
                  onDeleteAnnotation(viewingAnnotation.id)
                  closeViewingAnnotation()
                }}
                className="text-sm font-medium text-danger"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}