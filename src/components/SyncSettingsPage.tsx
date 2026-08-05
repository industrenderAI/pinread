import { useState } from 'react'
import type { User } from '../types/item'

// 要跟 index.css 里 .page-slide-out 的动画时长对上。
const CLOSE_ANIMATION_MS = 250

function formatSyncedAt(ts: number | null): string {
  if (!ts) return '尚未同步'

  const diffSec = Math.round((Date.now() - ts) / 1000)

  if (diffSec < 5) return '刚刚'
  if (diffSec < 60) return `${diffSec} 秒前`

  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin} 分钟前`

  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `今天 ${hh}:${mm}`
}

export function SyncSettingsPage({
  user,
  lastSyncedAt,
  refreshing,
  onBack,
  onRefresh,
  onLoginClick,
}: {
  user: User | null
  lastSyncedAt: number | null
  refreshing: boolean
  onBack: () => void
  onRefresh: () => Promise<void>
  onLoginClick: () => void
}) {
  const [closing, setClosing] = useState(false)
  const [justSynced, setJustSynced] = useState(false)

  const handleBack = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onBack, CLOSE_ANIMATION_MS)
  }

  const handleRefresh = async () => {
    await onRefresh()
    setJustSynced(true)
    setTimeout(() => setJustSynced(false), 1600)
  }

  return (
    <div
      className={`fixed inset-0 z-30 mx-auto flex max-w-lg flex-col bg-paper ${
        closing ? 'page-slide-out' : 'page-slide-in'
      }`}
    >
      <div className="relative flex items-center px-4 py-5">
        <button
          onClick={handleBack}
          aria-label="返回"
          className="-m-3.5 flex items-center justify-center p-4 text-accent-text"
        >
          <img src="/icons/back.svg" className="h-auto w-3" alt="Return to previous page" />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 text-base font-bold">
          同步设定
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-2">

        {/* 同步状态卡片 */}
        <div className="rounded-xl border border-line bg-paper-card p-4">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                user ? 'bg-accent' : 'bg-ink-faint'
              }`}
            />
            <span className="text-sm font-bold text-ink">
              {user ? '已登录，正在同步到云端' : '仅保存在本机，未同步'}
            </span>
          </div>

          {user ? (
            <p className="mt-2 text-xs text-ink-faint">
              账号：{user.email} · 上次同步：{formatSyncedAt(lastSyncedAt)}
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-faint">
              笔记目前只存在这台设备的浏览器里，换个设备或清空浏览器数据都会丢失。登录后会自动同步到云端，并且可以在任何设备上查看。
            </p>
          )}

          {!user && (
            <button
              onClick={onLoginClick}
              className="mt-3 h-9 w-full rounded-full bg-ink text-xs font-bold text-paper"
            >
              点击登录，开启同步
            </button>
          )}
        </div>

        {/* 手动重新同步 */}
        {user && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm text-ink disabled:opacity-50"
          >
            {refreshing ? '同步中…' : justSynced ? '✓ 已是最新' : '重新同步'}
          </button>
        )}

        {/* 说明文字 */}
        <div className="mt-8">
          <p className="mb-2 text-xs font-bold text-ink-faint">同步是怎么回事</p>
          <ul className="space-y-2 text-xs leading-relaxed text-ink-faint">
            <li>· 没登录时，笔记只存在这台设备本地，不会上传到任何地方。</li>
            <li>· 登录后，每次新增、编辑、删除笔记或分类，都会实时直接写入云端，不需要手动点"同步"。</li>
            <li>· 首次登录时，会自动把之前在本机存的笔记搬到云端一次，之后就不会重复搬了。</li>
            <li>· "重新同步"按钮用于：怀疑当前页面数据不是最新（比如在另一台设备改过），手动重新拉取一次云端的最新内容。</li>
          </ul>
        </div>

      </div>
    </div>
  )
}