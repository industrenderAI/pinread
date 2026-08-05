import { useState } from 'react'
import type { Category } from '../types/item'

// 要跟 index.css 里 .sheet-panel-closing 的动画时长对上，
// 不然会出现"弹窗已经消失但组件还没卸载"或者相反的情况。
const CLOSE_ANIMATION_MS = 220

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-on-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-ink-faint"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/** 首页那颗"全部笔记 ▾"触发按钮，点了才弹出下面的筛选面板 */
export function CategoryFilterField({
  label,
  onOpen,
}: {
  label: string
  onOpen: () => void
}) {
  return (
    <button
      onClick={onOpen}
      className="inline-flex items-center mt-1 gap-1 rounded-full border border-line bg-paper-card px-4 py-1.5 text-xs font-bold text-ink"
    >
      <span>{label}</span>
      <ChevronDown />
    </button>
  )
}

/** 弹出的筛选面板：全部笔记 + 每个分类 + 未分类，选中的打勾 */
export function CategoryFilterSheet({
  categories,
  hasUnfiled,
  value,
  onSelect,
  onClose,
}: {
  categories: Category[]
  hasUnfiled: boolean
  value: string
  onSelect: (value: string) => void
  onClose: () => void
}) {
  const [closing, setClosing] = useState(false)

  // 所有"关闭"的入口都走这里：先播放向下滑出的动画，
  // 动画播完了再真正调用 onClose 让父组件卸载这个弹窗。
  const requestClose = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  const handlePick = (next: string) => {
    onSelect(next)
    requestClose()
  }

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-lg items-end">
      <div className="absolute inset-0" onClick={requestClose} />

      <div
        className={`relative z-10 flex min-h-[50vh] max-h-[70vh] w-full flex-col  rounded-t-2xl  bg-paper pb-6 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.10)] ${
          closing ? 'sheet-panel-closing' : 'sheet-panel'
        }`}
      >
        <div className="flex items-center justify-between  px-5 py-5">
          <span className="text-lg font-bold text-ink">分类</span>
          <button onClick={requestClose} aria-label="关闭">
            <img src="/icons/close.svg" alt="" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">

          <button
            onClick={() => handlePick('all')}
            className="flex w-full items-center justify-between  py-3.5 left text-lg font-bold text-ink"
          >
            <span>全部</span>
            {value === 'all' && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                <CheckIcon />
              </span>
            )}
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handlePick(c.name)}
              className="flex w-full items-center justify-between border-b border-line/60 py-3.5 text-left text-sm text-ink"
            >
              <span>{c.name}</span>
              {value === c.name && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <CheckIcon />
                </span>
              )}
            </button>
          ))}

          {hasUnfiled && (
            <button
              onClick={() => handlePick('')}
              className="flex w-full items-center justify-between py-3.5 text-left text-sm text-ink"
            >
              <span>未分类</span>
              {value === '' && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <CheckIcon />
                </span>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  )
}