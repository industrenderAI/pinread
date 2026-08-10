// import { useRef, useState } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Item } from '../types/item'
import { NoteModal } from './NoteModal'
import { isUrl, openExternal } from '../lib/url'

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  )
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19.93 27.53" className={className} fill="currentColor">
      <path d="M18.93,27.53c-.21,0-.42-.06-.59-.2L0,13.77,18.34.2c.44-.33,1.07-.24,1.4.21.33.44.24,1.07-.21,1.4L3.36,13.77l16.17,11.96c.44.33.54.95.21,1.4-.2.27-.5.41-.8.41Z" />
    </svg>
  )
}

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
}: {
  item: Item
  theme: 'light' | 'dark'
  onBack: () => void
  onEdit: () => void
  onToggleTheme: () => void
  onAddAnnotation: (start: number, end: number, note: string) => void
  onDeleteAnnotation: (annotationId: string) => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [pendingRange, setPendingRange] = useState<{ start: number; end: number; text: string } | null>(
    null,
  )
  const [selectionMenu, setSelectionMenu] = useState<{
  x:number
  y:number
  start:number
  end:number
  text:string
} | null>(null)
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [sizePanelOpen, setSizePanelOpen] = useState(false)
  const [fontStep, setFontStep] = useState(2)
  const [annotationsVisible, setAnnotationsVisible] = useState(true)
  useEffect(() => {
    const handler = () => {
      handleSelection()
    }

    document.addEventListener('selectionchange', handler)

    return () => {
      document.removeEventListener('selectionchange', handler)
    }
  }, [])

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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

    // setPendingRange({ start, end, text: item.content.slice(start, end) })
    // sel.removeAllRanges()
    const text = item.content.slice(start, end)
    const rect = range.getBoundingClientRect()

    setTimeout(() => {
      setSelectionMenu({
        x: rect.left + rect.width / 2,
        y: rect.top - 60,
        start,
        end,
        text,
      })
    }, 50)
  }

  const sortedAnns = [...item.annotations].sort((a, b) => a.start - b.start)
  const nodes: React.ReactNode[] = []
  let pos = 0
  sortedAnns.forEach((a) => {
    if (pos < a.start) nodes.push(item.content.slice(pos, a.start))
    const isOpen = expanded.has(a.id)
    nodes.push(
      <span key={a.id}>
        <span className={`ann ${isOpen ? 'active' : ''}`} onClick={() => toggle(a.id)}>
          {item.content.slice(a.start, a.end)}
        </span>
        {isOpen && (
          <span className="mt-1.5 mb-2.5 block rounded-lg bg-accent-soft px-3 py-2.5 font-sans">
            <span className="block whitespace-pre-wrap text-sm text-ink">{a.note}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteAnnotation(a.id)
              }}
              className="mt-1 block text-xs text-danger"
            >
              删除这条批注
            </button>
          </span>
        )}
      </span>,
    )
    pos = a.end
  })
  if (pos < item.content.length) nodes.push(item.content.slice(pos))

  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-lg flex-col bg-paper">
      <div className="flex items-center justify-between px-4 py-3.5">
        <button onClick={onBack}>
          <BackIcon className="w-4 h-4" />
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
                className="mb-3.5 inline-flex items-center gap-1 text-[13px] text-ink-faint hover:text-ink"
              >
                查看来源
                <ExternalLinkIcon className="h-3 w-3" />
              </button>
            ) : (
              <p className="mb-3.5 text-[13px] text-ink-faint">来自：{item.source}</p>
            )
          )}
        </div>
      </div>

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

      {selectionMenu && (
      <div
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
        left:selectionMenu.x,
        top:selectionMenu.y,
        transform:'translateX(-50%)'
      }}
      >


      <button
      onClick={()=>{
      setPendingRange({
        start:selectionMenu.start,
        end:selectionMenu.end,
        text:selectionMenu.text
      })

      setSelectionMenu(null)
      }}
      className="flex flex-col items-center text-xs"
      >
      {/* <span>✎</span> */}
      笔记
      </button>

      <button
      onClick={()=>{
      console.log(
        "AI:",
        selectionMenu.text
      )
      }}
      className="flex flex-col items-center text-xs"
      >
      {/* <span>AI</span> */}
      AI

      </button>

      <button
      onClick={()=>{
      navigator.clipboard.writeText(
      selectionMenu.text
      )
      setSelectionMenu(null)
      }}
      className="flex flex-col items-center text-xs"
      >
      {/* <span>COPY</span> */}
      复制
      </button>

      <button
      onClick={()=>{
      window.getSelection()?.removeAllRanges()
      setSelectionMenu(null)
      }}
      className="flex flex-col items-center text-xs"
      >

      {/* <span>×</span> */}
      取消
      </button>
      </div>
      )}
    </div>
    
  )
}
