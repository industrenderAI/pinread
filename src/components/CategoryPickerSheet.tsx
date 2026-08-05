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

/** 表单里那一行"分类：xxx ›"，点了才弹出真正的选择面板 */
export function CategoryPickerField({
  value,
  onOpen,
}: {
  value: string
  onOpen: () => void
}) {
  return (
    <button
      onClick={onOpen}
      className="flex h-11 w-full items-center justify-between rounded-lg border border-line bg-paper-card px-3 text-sm"
    >
      <span className={value ? 'text-ink' : 'text-ink-faint'}>
        {value || '选择分类'}
      </span>
      <ChevronDown />
    </button>
  )
}

/** 真正的弹出面板：底部滑出的分类列表 + 新建分类入口 */
export function CategoryPickerSheet({
  categories,
  value,
  onSelect,
  onAddCategory,
  onClose,
}: {
  categories: Category[]
  value: string
  onSelect: (name: string) => void
  onAddCategory: (name: string) => Promise<Category>
  onClose: () => void
}) {
  const [closing, setClosing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  // 所有"关闭"的入口都走这里：先播放向下滑出的动画，
  // 动画播完了再真正调用 onClose 让父组件卸载这个弹窗。
  const requestClose = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  const handleAdd = async () => {
    const name = newName.trim()

    if (!name) {
      setAddError('请输入分类名称')
      return
    }

    // 本地先查一遍是否重名，比等后端报错更快、提示也更友好
    if (categories.some((c) => c.name === name)) {
      setAddError('这个分类已经存在了')
      return
    }

    setAddError(null)
    setSubmitting(true)

    try {
      const cat = await onAddCategory(name)

      setNewName('')
      onSelect(cat.name)
      setJustAdded(cat.name)

      // 让用户看一眼"已添加成功"，再自动关闭弹窗
      setTimeout(() => {
        requestClose()
      }, 700)
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : '添加失败，请重试',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-lg items-end">
      <div className="absolute inset-0" onClick={requestClose} />

      <div
        className={`relative z-10 flex min-h-[40vh] max-h-[70vh] w-full flex-col rounded-t-2xl bg-paper pb-6 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.15)] ${
          closing ? 'sheet-panel-closing' : 'sheet-panel'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <span className="text-base font-medium text-ink">选择分类</span>
          <button onClick={requestClose} aria-label="关闭">
            <img src="/icons/close.svg" alt="" className="h-4 w-4" />
          </button>
        </div>

        {justAdded && (
          <div className="mx-5 mt-3 flex items-center gap-1.5 rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent-text">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent">
              <CheckIcon />
            </span>
            已成功添加「{justAdded}」
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {categories.length === 0 && !adding && (
            <p className="py-6 text-center text-xs text-ink-faint">
              还没有分类，先添加一个吧
            </p>
          )}

          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onSelect(c.name)
                requestClose()
              }}
              className="flex w-full items-center justify-between border-b border-line/60 py-3.5 text-left text-sm text-ink last:border-b-0"
            >
              <span>{c.name}</span>
              {value === c.name && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                  <CheckIcon />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="px-5 pt-2">
          {adding ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    if (addError) setAddError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="比如：英语学习"
                  className="h-10 flex-1 rounded-lg border border-line bg-paper-card px-3 text-sm outline-none"
                />
                <button
                  onClick={handleAdd}
                  disabled={submitting}
                  className="rounded-lg bg-accent px-4 text-sm text-on-accent disabled:opacity-50"
                >
                  {submitting ? '添加中…' : '添加'}
                </button>
              </div>
              {addError && <p className="text-xs text-danger">{addError}</p>}
            </div>
          ) : (
            <button
              onClick={() => {
                setAdding(true)
                setAddError(null)
              }}
              className="flex h-10 w-full items-center justify-center gap-1 rounded-lg border border-dashed border-line text-sm text-ink-faint"
            >
              + 新建分类
            </button>
          )}
        </div>
      </div>
    </div>
  )
}