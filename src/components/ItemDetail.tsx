// import { useRef, useState } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Item } from '../types/item'
import { NoteModal } from './NoteModal'

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
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <button onClick={onBack} className="text-[15px] text-accent-text">
              <div  className='flex justify-between gap-2.5'>
               <img 
               src="/icons/back.svg" alt="Return to home" 
               className="h-4 w-auto" />
               </div>
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
        {/* {item.source && <p className="mb-3.5 text-[13px] text-ink-faint">来自：{item.source}</p>} */}
        <div className={annotationsVisible ? '' : 'ann-hidden'}>
          {/* <div
            ref={contentRef}
            onMouseUp={handleSelection}
            onTouchEnd={() => setTimeout(handleSelection, 50)}
            style={{ fontSize: FONT_SIZES[fontStep] }}
            className="font-serif-cn whitespace-pre-wrap leading-loose"
          > */}
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
        <p className="mt-4 border-t border-line pt-3.5 text-[12.5px] leading-relaxed text-ink-faint">
          选中文字后可添加批注，点击划线可展开/隐藏笔记。
        </p>
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
      <span>✎</span>
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
      <span>AI</span>
      解释

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
      <span>□</span>
      复制
      </button>

      <button
      onClick={()=>{
      window.getSelection()?.removeAllRanges()
      setSelectionMenu(null)
      }}
      className="flex flex-col items-center text-xs"
      >

      <span>×</span>
      取消
      </button>
      </div>
      )}
    </div>
    
  )
}
