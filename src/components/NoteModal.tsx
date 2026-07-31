import { useState } from 'react'

export function NoteModal({
  quote,
  onCancel,
  onSave,
}: {
  quote: string
  onCancel: () => void
  onSave: (note: string) => void
}) {
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-t-2xl bg-paper-card px-5 pb-6.5 pt-4.5">
        <p className="mb-2 text-base text-ink font-bold">添加笔记</p>
        <p className="mb-2.5 text-[15px] font-medium text-accent-text">&quot;{quote}&quot;</p>
        <textarea
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="在此处输入笔记内容"
          className="min-h-22.5 w-full rounded-lg border border-line bg-paper p-2.5 text-sm outline-none"
        />
        <div className="mt-3 flex gap-2.5">
          <button
            onClick={onCancel}
            className="h-10 flex-1 rounded-lg border border-line bg-paper text-sm text-ink"
          >
            取消
          </button>
          <button
            onClick={() => note.trim() && onSave(note.trim())}
            className="h-10 flex-1 rounded-lg bg-accent text-sm text-on-accent"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
