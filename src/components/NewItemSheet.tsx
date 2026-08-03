import { useState } from 'react'
import type { Category } from '../types/item'
import { CategoryPickerField, CategoryPickerSheet } from './CategoryPickerSheet'

export function NewItemSheet({
  categories,
  initial,
  onCancel,
  onSave,
  onAddCategory,
}: {
  categories: Category[]
  initial?: { content: string; source: string; category: string }
  onCancel: () => void
  onSave: (content: string, source: string, category: string) => void
  onAddCategory: (name: string) => Promise<Category>
}) {
  const isEdit = !!initial

  const [content, setContent] = useState(initial?.content ?? '')
  const [source, setSource] = useState(initial?.source ?? '')
  const [category, setCategory] = useState(
    initial?.category ?? categories[0]?.name ?? ''
  )

  const [pickerOpen, setPickerOpen] = useState(false)


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


  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-lg flex-col bg-paper">

      <div className="flex items-center justify-between px-4 py-6">
        <button
          onClick={onCancel}
          className="text-base font-semibold text-ink"
        >
          取消
        </button>

        <span className="text-xl font-bold">
          {isEdit ? '编辑笔记' : '新笔记'}
        </span>

        <button
          onClick={handleSave}
          className="text-base font-semibold text-ink"
        >
          完成
        </button>
      </div>



      <div className="flex-1 overflow-y-auto px-5 py-2">

        <p className="mb-1.5 py-2 text-base font-bold text-ink">
          分类
        </p>

        <div className="mb-3.5">
          <CategoryPickerField value={category} onOpen={() => setPickerOpen(true)} />
        </div>



        <p className="my-1.5 py-2 text-base font-bold text-ink">
          来源
        </p>


        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="选填，如纽约时报"
          className="mb-3.5 h-9.5 w-full rounded-lg border border-line bg-paper-card px-2.5 text-sm outline-none"
        />



        <p className="my-1.5 py-2 text-base font-bold text-ink">
          笔记内容
        </p>


        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在这里粘贴或输入内容…"
          className="min-h-40 w-full rounded-lg border border-line bg-paper-card p-2.5 text-[15.5px] leading-relaxed outline-none"
        />


        {isEdit && (
          <p className="mt-2.5 text-xs leading-relaxed text-ink-faint">
            提醒：如果修改了这里的原文内容，之前在这篇笔记里加的批注会被清空（批注是按原文位置定位的，原文变了位置就对不上了）。只改来源或分类不影响批注。
          </p>
        )}

      </div>

      {pickerOpen && (
        <CategoryPickerSheet
          categories={categories}
          value={category}
          onSelect={setCategory}
          onAddCategory={onAddCategory}
          onClose={() => setPickerOpen(false)}
        />
      )}

    </div>
  )
}