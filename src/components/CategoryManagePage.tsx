import { useState } from 'react'
import type { Category, Item } from '../types/item'
import { CATEGORY_COLOR_PRESETS, pickNextCategoryColor } from '../lib/categoryColors'
import { CategoryDot } from './CategoryDot'

// 要跟 index.css 里 .page-slide-out 的动画时长对上，
// 不然会出现"页面已经滑走但还没真正切回首页"或者相反的情况。
const CLOSE_ANIMATION_MS = 250

/** 一排预设色圆点，点哪个就选中哪个 */
function ColorSwatchRow({
  value,
  onChange,
}: {
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {CATEGORY_COLOR_PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          aria-label={preset.label}
          onClick={() => onChange(preset.key)}
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            value === preset.key ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''
          }`}
          style={{ backgroundColor: preset.hex }}
        />
      ))}
    </div>
  )
}

export function CategoryManagePage({
  categories,
  items,
  onBack,
  onAdd,
  onUpdate,
  onDelete,
}: {
  categories: Category[]
  items: Item[]
  onBack: () => void
  onAdd: (name: string, color: string) => Promise<Category>
  onUpdate: (id: string, name: string, color: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(() => pickNextCategoryColor(categories.length))
  const [addError, setAddError] = useState<string | null>(null)


  const [closing, setClosing] = useState(false)
  const CategoryManageBack = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onBack, CLOSE_ANIMATION_MS)
  }

  return (
    <div className={`fixed inset-0 z-20 mx-auto flex max-w-lg flex-col bg-paper ${
        closing ? 'page-slide-out' : 'page-slide-in'
      }`}>
      <div className="relative flex items-center px-4 py-5">
        <button
          onClick={CategoryManageBack}
          aria-label="Return"
          className="-m-3.5 flex items-center justify-center p-4 text-accent-text"
        >
          <img
            src="/icons/back.svg"
            className="h-auto w-3"
            alt="Return to previous page"
          />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
          分类管理
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5">
        <div className="flex text-xs text-ink-faint gap-6">
          <input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value)

              if (addError) setAddError(null)
            }}
            placeholder="输入新分类"
            className="
              h-10
              flex-1
              border-b
             border-line/60
             focus:border-accent
              focus:outline-hidden
              bg-paper-card
              px-3
              text-sm
              outline-none
              text-ink/50
            "
          />

          <button
            onClick={async () => {
              const name = newName.trim()

              if (!name) return

              if (categories.some((c) => c.name === name)) {
                setAddError('这个分类已经存在了')
                return
              }

              try {
                await onAdd(name, newColor)
                setNewName('')
                setNewColor(pickNextCategoryColor(categories.length + 1))
              } catch (err) {
                setAddError(
                  err instanceof Error ? err.message : '添加失败，请重试'
                )
              }
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-2xl leading-none text-on-accent"
          >
            +
          </button>
        </div>

        {/* 新分类的颜色 */}
        <div className="mt-3">
          <ColorSwatchRow value={newColor} onChange={setNewColor} />
        </div>

        {/* 分类名判断与提示 */}
        {addError && (
          <p className="mt-3 text-xs font-medium text-danger">
            {addError}
          </p>
        )}

        <div className="mt-6 flex flex-col">
          {categories.map((c) => (
            <CategoryRow
              key={c.id}
              category={c}
              itemCount={items.filter((it) => it.category === c.name).length}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryRow({
  category,
  itemCount,
  onUpdate,
  onDelete,
}: {
  category: Category
  itemCount: number
  onUpdate: (id: string, name: string, color: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState(category.color ?? CATEGORY_COLOR_PRESETS[0].key)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <div className="py-5 px-4">
      <div className="flex items-center justify-between">
        {edit ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
              h-10
              flex-1
              border-b
             border-line/60
             focus:border-accent
              focus:outline-hidden
              bg-paper-card
              font-bold
              text-lg
              outline-none
              text-ink
            "
          />
        ) : (
          <span className="flex items-center gap-2 text-base font-bold text-ink">
            <CategoryDot color={category.color} className="h-2.5 w-2.5" />
            {category.name}
          </span>
        )}

        {/* 右边编辑 / 删除 */}
        <div className="flex gap-6 text-xs text-ink-faint">
          <button
            onClick={async () => {
              if (edit) {
                await onUpdate(category.id, name, color)
              }

              setEdit(!edit)
            }}
          >
            {edit ? '保存' : '编辑'}
          </button>

          <button
            onClick={() => {
              // 没有笔记在用，直接删；有笔记在用，先弹确认
              if (itemCount === 0) {
                onDelete(category.id)
                return
              }

              setConfirmDelete(true)
            }}
          >
            删除
          </button>
        </div>
      </div>

      {edit && (
        <div className="mt-3">
          <ColorSwatchRow value={color} onChange={setColor} />
        </div>
      )}

      {confirmDelete && (
        <div className="mt-2 rounded-lg bg-paper-card shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.10)] p-3">
          <p className="text-xs/5 text-ink">
            「{category.name}」包含 {itemCount}
            篇笔记，删除此分类后，笔记将会自动移到"未分类"。
          </p>

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="h-8 flex-1 rounded-full border border-line text-xs text-ink"
            >
              取消
            </button>

            <button
              disabled={deleting}
              onClick={async () => {
                setDeleting(true)
                await onDelete(category.id)
                setDeleting(false)
                setConfirmDelete(false)
              }}
              className="h-8 flex-1 rounded-full bg-ink text-xs text-paper disabled:opacity-50"
            >
              确认删除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}