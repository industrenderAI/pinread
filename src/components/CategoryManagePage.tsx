import { useState } from 'react'
import type { Category, Item } from '../types/item'

// 要跟 index.css 里 .page-slide-out 的动画时长对上，
// 不然会出现"页面已经滑走但还没真正切回首页"或者相反的情况。
const CLOSE_ANIMATION_MS = 250

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
  onAdd: (name: string) => Promise<Category>
  onUpdate: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [newName, setNewName] = useState('')
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
              px-3
              text-lg
              outline-none
              text-ink
            "
          />

          <button
            onClick={async () => {
              const name = newName.trim()

              if (!name) return

              if (categories.some((c) => c.name === name)) {
                setAddError('此分类已存在')
                return
              }

              try {
                await onAdd(name)
                setNewName('')
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
  onUpdate: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [edit, setEdit] = useState(false)
  const [name, setName] = useState(category.name)
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
              text-accent-text
            "
          />
        ) : (
          <span className="text-base font-bold text-ink">
            {category.name}
          </span>
        )}

        {/* 右边编辑 / 删除 */}
        <div className="flex gap-6 text-xs text-ink-faint">
          <button
            onClick={async () => {
              if (edit) {
                await onUpdate(category.id, name)
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

      {confirmDelete && (
        <div className="mt-2 rounded-lg border border-danger/40 p-3">
          <p className="text-xs text-ink">
            「{category.name}」下有 {itemCount}
            篇笔记，删除分类后这些笔记会自动移到"未分类"，笔记本身不会被删除。
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
              className="h-8 flex-1 rounded-full bg-danger text-xs text-paper disabled:opacity-50"
            >
              确认删除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}