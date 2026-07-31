import { useState } from 'react'
import type { Language } from '../types/item'

export function ItemFormSheet({
  mode,
  languages,
  initialContent = '',
  initialSource = '',
  initialLanguage,
  onCancel,
  onSave,
  onAddLanguage,
}: {
  mode: 'new' | 'edit'
  languages: Language[]
  initialContent?: string
  initialSource?: string
  initialLanguage?: string
  onCancel: () => void
  onSave: (content: string, source: string, language: string) => void
  onAddLanguage: (name: string) => Promise<Language>
}) {
  const [content, setContent] = useState(initialContent)
  const [source, setSource] = useState(initialSource)
  const [language, setLanguage] = useState(initialLanguage ?? languages[0]?.name ?? '')
  const [addingLang, setAddingLang] = useState(false)
  const [newLangName, setNewLangName] = useState('')

  const handleSave = () => {
    if (!content.trim()) {
      onCancel()
      return
    }
    onSave(content.trim(), source.trim(), language || '未分类')
  }

  const handleAddLanguage = async () => {
    const name = newLangName.trim()
    if (!name) return
    const lang = await onAddLanguage(name)
    setLanguage(lang.name)
    setNewLangName('')
    setAddingLang(false)
  }

  return (
    <div className="fixed inset-0 z-30 mx-auto flex max-w-lg flex-col bg-paper">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <button onClick={onCancel} className="text-[15px] text-accent-text">
          取消
        </button>
        <span className="text-[15px] font-medium">{mode === 'new' ? '新笔记' : '修改内容'}</span>
        <button onClick={handleSave} className="text-[15px] text-accent-text">
          完成
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10 pt-4">
        <p className="mb-1.5 text-xs text-ink-faint">语言分类</p>
        <div className="mb-3.5 flex flex-wrap gap-2">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => setLanguage(l.name)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                language === l.name
                  ? 'bg-accent text-on-accent'
                  : 'border border-line bg-paper-card text-ink-soft'
              }`}
            >
              {l.name}
            </button>
          ))}
          {!addingLang && (
            <button
              onClick={() => setAddingLang(true)}
              className="rounded-full border border-dashed border-line px-3 py-1.5 text-sm text-ink-faint"
            >
              + 新语言
            </button>
          )}
        </div>
        {addingLang && (
          <div className="mb-3.5 flex gap-2">
            <input
              autoFocus
              value={newLangName}
              onChange={(e) => setNewLangName(e.target.value)}
              placeholder="比如：日语"
              className="h-9 flex-1 rounded-lg border border-line bg-paper-card px-3 text-sm outline-none"
            />
            <button
              onClick={handleAddLanguage}
              className="rounded-lg bg-accent px-3 text-sm text-on-accent"
            >
              添加
            </button>
          </div>
        )}

        <p className="mb-1.5 text-xs text-ink-faint">来源（可选，比如"纽约时报文章"）</p>
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="自己填写来源"
          className="mb-3.5 h-9.5 w-full rounded-lg border border-line bg-paper-card px-2.5 text-sm outline-none"
        />

        <p className="mb-1.5 text-xs text-ink-faint">粘贴单词 / 一句话 / 一段文章</p>
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
