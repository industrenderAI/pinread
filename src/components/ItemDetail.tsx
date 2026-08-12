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

  useEffect(() => {
    const handler = () => {
      handleSelection()
    }

    document.addEventListener('selectionchange', handler)

    return () => {
      document.removeEventListener('selectionchange', handler)
    }
  }, [])

  // 选中菜单渲染出来后，测量真实尺寸，再把它约束在可视区域内（不越界、自动上下翻转）
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

    // 优先放在选区上方，上方空间不够就翻到下方
    let top = selectionMenu.anchorTop - menuRect.height - gap
    if (top < margin) {
      top = selectionMenu.anchorBottom + gap
    }
    top = Math.max(margin, Math.min(top, vh - menuRect.height - margin))

    setMenuPos({ left, top })
  }, [selectionMenu])

  const handleSelection = () => {
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
    }, 50)
  }

  const closeViewingAnnotation = () => {
    setViewingAnnotation(null)
  }

  const sortedAnns = [...item.annotations].sort((a, b) => a.start - b.start)
  const nodes: React.ReactNode[] = []
  let pos = 0
  sortedAnns.forEach((a) => {
    if (pos < a.start) nodes.push(item.content.slice(pos, a.start))
    nodes.push(
      <span
        key={a.id}
        className={`ann ${viewingAnnotation?.id === a.id ? 'active' : ''}`}
        onClick={() => setViewingAnnotation(a)}
      >
        {item.content.slice(a.start, a.end)}
      </span>,
    )
    pos = a.end
  })
  if (pos < item.content.length) nodes.push(item.content.slice(pos))

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
            onMouseUp={handleSelection}
            onTouchEnd={() => {}}
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
          if (!immersive) setToolbarOpen(false) // 进入全屏时顺手收起编辑工具条
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
          className="
          fixed
          z-50
          flex
          items-center
          gap-5
          rounded-xl
          bg-black
          px-4
          py-3
          text-white
          shadow-xl
          "
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-6"
          onClick={closeViewingAnnotation}
        >
          <div
            className="w-full  max-w-sm rounded-lg bg-paper-card p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 rounded-lg  py-4 text-sm font-bold text-ink border-b border-line ">
              {item.content.slice(viewingAnnotation.start, viewingAnnotation.end)}
            </p>

            <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink">
              {viewingAnnotation.note}
            </p>

            <div className="mt-12 flex items-center justify-end gap-6">
              <button
                onClick={() => {
                  setEditingAnnotation(viewingAnnotation)
                  setViewingAnnotation(null)
                }}
                className="text-sm text-ink"
              >
                修改
              </button>
              <button
                onClick={() => {
                  onDeleteAnnotation(viewingAnnotation.id)
                  closeViewingAnnotation()
                }}
                className="text-sm text-danger"
              >
                删除
              </button>
              <button onClick={closeViewingAnnotation} className="text-sm text-ink">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}