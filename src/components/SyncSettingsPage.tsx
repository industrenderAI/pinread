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
      className={`fixed inset-0 z-30  mx-auto flex max-w-lg flex-col bg-paper ${
        closing ? 'page-slide-out' : 'page-slide-in'
      }`}
    >
      <div className='bg-ink/5 h-full w-full'>
        <div className="relative flex items-center px-4 py-5 bg-paper">
          <button
            onClick={handleBack}
            aria-label="返回"
            className="-m-3.5 flex items-center justify-center p-4 text-accent-text"
          >
            <img src="/icons/back.svg" className="h-auto w-3" alt="Return to previous page" />
          </button>

          <span className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
            云同步
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-6 ">

          {/* 同步状态卡片 */}
          <div className="rounded-xl border border-line bg-paper-card px-3 py-6">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  user ? 'bg-accent' : 'bg-ink-faint'
                }`}
              />
              <span className="text-lg font-bold text-ink">
                {user ? '云同步已开启' : '尚未同步'}
              </span>
            </div>

            {user ? (
              <div className="mt-4 text-xs text-ink-faint flex justify-between items-center">
                <span>{user.email}</span>
                <span>上次同步：{formatSyncedAt(lastSyncedAt)}</span>
              </div>
            ) : (
              <div className="mt-4 text-xs text-ink-faint">
                登录后会自动云端同步，登录其他设备同步查看。
              </div>
            )}
          </div>
            {!user && (
              <button
                onClick={onLoginClick}
              className="mt-6 h-11 w-full rounded-full bg-ink text-sm font-medium text-paper  active:bg-ink/80"
              >
                点击登录，开启同步
              </button>
            )}

          {/* 手动重新同步 */}
          {user && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-6 h-11 w-full rounded-full bg-ink text-sm font-medium text-paper  active:bg-ink/80"
            >
              {refreshing ? '同步中…' : justSynced ? '✓ 已是最新' : '重新同步'}
            </button>
          )}

          {/* 说明文字 */}
          <div className="mt-auto pt-16">
            <p className="mb-2 text-xs font-extrabold text-ink-soft">关于同步</p>
            <ul className="space-y-2 text-xs leading-relaxed text-ink-soft">
              <li>· 未登录时，数据仅保存在当前设备。</li>
              <li>· 登录后，所有修改都会自动同步到云端。</li>
              <li>· 如果你在其他设备修改了数据，可以点击「重新同步」获取最新内容。</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}