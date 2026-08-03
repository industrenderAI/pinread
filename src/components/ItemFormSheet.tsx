import { useState } from 'react'
import type { Category } from '../types/item'

export function ItemFormSheet({
  mode,
  categories,
  initialContent = '',
  initialSource = '',
  initialCategory,
  onCancel,
  onSave,
  onAddCategory,
}: {
  mode: 'new' | 'edit'
  categories: Category[]
  initialContent?: string
  initialSource?: string
  initialCategory?: string
  onCancel: () => void
  onSave: (content: string, source: string, category: string) => void
  onAddCategory: (name: string) => Promise<Category>
}) {
  const [content, setContent] = useState(initialContent)
  const [source, setSource] = useState(initialSource)

  const [category, setCategory] = useState(
    initialCategory ?? categories[0]?.name ?? ''
  )

  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')


  const handleSave = () => {
    if (!content.trim()) {
      onCancel()
      return
    }

    onSave(
      content.trim(),
      source.trim(),
      category || '未分类'
    )
  }


  const handleAddCategory = async () => {
    const name = newCategoryName.trim()

    if (!name) return

    const cat = await onAddCategory(name)

    setCategory(cat.name)
    setNewCategoryName('')
    setAddingCategory(false)
  }


  return (
    <div className="fixed inset-0 z-30 mx-auto flex max-w-lg flex-col bg-paper">

      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">

        <button
          onClick={onCancel}
          className="text-[15px] text-accent-text"
        >
          取消
        </button>

        <span className="text-[15px] font-medium">
          {mode === 'new' ? '新笔记' : '修改内容'}
        </span>

        <button
          onClick={handleSave}
          className="text-[15px] text-accent-text"
        >
          完成
        </button>

      </div>


      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-4">


        <p className="mb-1.5 text-xs text-ink-faint">
          分类
        </p>


        <div className="mb-3.5 flex flex-wrap gap-2">

          {categories.map((c) => (

            <button
              key={c.id}
              onClick={() => setCategory(c.name)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                category === c.name
                  ? 'bg-accent text-on-accent'
                  : 'border border-line bg-paper-card text-ink-soft'
              }`}
            >
              {c.name}
            </button>

          ))}


          {!addingCategory && (

            <button
              onClick={() => setAddingCategory(true)}
              className="rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-ink-faint"
            >
              + 新分类
            </button>

          )}

        </div>



        {addingCategory && (

          <div className="mb-3.5 flex gap-2">

            <input
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="比如：英语学习"
              className="h-9 flex-1 rounded-lg border border-line bg-paper-card px-3 text-sm outline-none"
            />

            <button
              onClick={handleAddCategory}
              className="rounded-lg bg-accent px-3 text-sm text-on-accent"
            >
              添加
            </button>

          </div>

        )}



        <p className="mb-1.5 text-xs text-ink-faint">
          来源（可选，比如"纽约时报文章"）
        </p>


        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="自己填写来源"
          className="mb-3.5 h-9.5 w-full rounded-lg border border-line bg-paper-card px-2.5 text-sm outline-none"
        />



        <p className="mb-1.5 text-xs text-ink-faint">
          粘贴单词 / 一句话 / 一段文章
        </p>


        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在这里粘贴或输入内容…"
          className="min-h-40 w-full rounded-lg border border-line bg-paper-card p-2.5 text-[15.5px] leading-relaxed outline-none"
        />


        {mode === 'edit' && (

          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            提示：如果修改了原文内容，之前在原文里加的批注位置可能会跟着错位，建议改动不大的时候再编辑正文。
          </p>

        )}

      </div>

    </div>
  )
}