import { useState } from 'react'

export function NoteModal({
  quote,
  onCancel,
  onSave,
  initialNote = '',
  title = '添加笔记',
}: {
  quote: string
  onCancel: () => void
  onSave: (note: string) => void
  initialNote?: string
  title?: string
}) {
  const [note, setNote] = useState(initialNote)

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25">
      <div className="w-full max-w-lg rounded-t-lg bg-paper-card px-5 pb-6.5 pt-4">
        <p className="mb-4 text-base text-ink font-bold">{title}</p>
        <p className="mb-4 text-xs font-bold text-accent-text">&quot;{quote}&quot;</p>
        <textarea
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="在此处输入笔记内容"
          className="min-h-70 w-full rounded-md border border-line bg-paper p-2.5 text-sm outline-none"
        />
        <div className="mt-3 flex gap-4">
          <button
            onClick={onCancel}
            className="h-10 flex-1 border border-line bg-paper text-sm text-ink"
          >
            取消
          </button>
          <button
            onClick={() => note.trim() && onSave(note.trim())}
            className="h-10 flex-1 bg-ink text-sm text-paper"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}