import { useState } from 'react'
import type { Category } from '../types/item'
import { CategoryPickerField, CategoryPickerSheet } from './CategoryPickerSheet'
import { isUrl } from '../lib/url'

function BackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19.93 27.53" className={className} fill="currentColor">
      <path d="M18.93,27.53c-.21,0-.42-.06-.59-.2L0,13.77,18.34.2c.44-.33,1.07-.24,1.4.21.33.44.24,1.07-.21,1.4L3.36,13.77l16.17,11.96c.44.33.54.95.21,1.4-.2.27-.5.41-.8.41Z" />
    </svg>
  )
}


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
  const [clipSuggestion, setClipSuggestion] = useState('')

  const handleSourceFocus = async () => {
    if (source) return
    try {
      const text = (await navigator.clipboard.readText()).trim()
      if (isUrl(text)) setClipSuggestion(text)
    } catch {
      // 剪贴板权限被拒绝或非 HTTPS 环境，静默忽略
    }
  }

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
          <BackIcon className="w-4 h-4" />
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
                onFocus={handleSourceFocus}
                placeholder="选填:如纽约时报或链接URL"
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
                    text-ink"
              />
              {clipSuggestion && (
                <button
                  type="button"
                  onClick={() => {
                    setSource(clipSuggestion)
                    setClipSuggestion('')
                  }}
                  className="mt-1.5 text-xs font-bold text-accent-text underline"
                >
                  检测到链接，点击填入↵
                </button>
              )}
            </div>
            
            <div className='mt-8'>
                <p className="mb-3.5 py-2 text-lg font-bold text-ink">
                  笔记内容
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="在这里粘贴或输入内容…"
                  className="min-h-100 w-full rounded-lg border border-line/60 focus:border-accent focus:outline-hidden bg-paper-card text-ink p-3 text-lg leading-relaxed outline-none"
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