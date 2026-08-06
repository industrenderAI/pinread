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
  onAddCategory: (name: string, color: string) => Promise<Category>
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
          <img src="/icons/close.svg" alt="Close icon" className="h-4 w-4" />
        </button>

        <span className="text-lg font-bold">
          {isEdit ? '编辑笔记' : '新笔记'}
        </span>

        <button
          onClick={handleSave}
          className="text-base font-semibold text-ink"
        >
          保存
        </button>
      </div>



      <div className="flex-1 overflow-y-auto px-5">
          <div className='mt-8'>
              <p className="mb-3.5 text-lg font-bold text-ink">
                分类
              </p>

              <div>
                <CategoryPickerField value={category} onOpen={() => setPickerOpen(true)} />
              </div>
          </div>
          
          <div className='mt-8'>
              <p className="mb-3.5 text-lg font-bold text-ink">
                来源
              </p>

              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="选填:如纽约时报"
                className="
                    w-full
                    h-10
                    flex-1
                    border-b
                  border-line/60
                  focus:border-accent
                    focus:outline-hidden
                    px-3
                    text-lg
                    outline-none
                    text-ink-faint"
              />
            </div>
            
            <div className='mt-8'>
                <p className="mb-3.5 py-2 text-lg font-bold text-ink">
                  笔记内容
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="在这里粘贴或输入内容…"
                  className="min-h-40 w-full rounded-lg border border-line/60 focus:border-accent focus:outline-hidden bg-paper-card text-ink-faint p-3 text-lg leading-relaxed outline-none"
                />


                {isEdit && (
                  <p className="mt-2.5 text-xs leading-relaxed text-ink-faint">
                    若修改原文内容，之前添加的笔记标记将会被清空。
                  </p>
                )}

              </div>
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