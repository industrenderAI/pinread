import { useState } from 'react'
import type { User } from '../types/item'

const MENU_ITEMS = ['账号', '同步', '语言', '帮助', '关于']

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-ink-faint"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export function ProfilePage({
  user,
  onBack,
  onLogin,
  onLogout,
}: {
  user: User | null
  onBack: () => void
  onLogin: (name: string) => void
  onLogout: () => void
}) {
  const [name, setName] = useState('')
  const [showLoginForm, setShowLoginForm] = useState(false)

  const submitLogin = () => {
    if (!name.trim()) return
    onLogin(name)
    setName('')
    setShowLoginForm(false)
  }

  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-lg flex-col bg-paper">
      <div className="relative flex items-center  px-4 py-3.5">
        <button onClick={onBack} className="text-[15px] text-accent-text">
          <img
            src="/icons/back.svg"
            alt="PinRead_Return"
            className="h-4 w-auto"
          />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-base font-medium">个人中心</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-6">
        {user ? (
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-sm font-medium text-ink">
                {user.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-faint">本地账号（尚未接入云同步）</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src="/icons/profile.svg"
              alt="default_avatar"
              className="h-12 w-12 shrink-0 rounded-full bg-paper-card"
            />
            <button
              onClick={() => setShowLoginForm((v) => !v)}
              className="h-8 shrink-0 rounded-full bg-ink px-4 text-xs font-medium text-paper"
            >
              点击登录
            </button>
          </div>
        )}

        {!user && showLoginForm && (
          <div className="mt-4 rounded-lg border border-line bg-paper-card p-3">
            <p className="text-xs leading-relaxed text-ink-faint">
              可以在多台设备间同步你的笔记。当前是本地体验版，数据仅存在这台设备上。
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitLogin()}
              placeholder="给自己起个名字"
              autoFocus
              className="mt-3 h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
            />
            <button
              onClick={submitLogin}
              className="mt-2 h-10 w-full rounded-lg bg-ink text-sm text-paper"
            >
              登录 / 注册
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col divide-y divide-line border-t border-b border-line">
          {MENU_ITEMS.map((label) => (
            <button
              key={label}
              className="flex items-center justify-between py-5 text-left text-sm text-ink"
            >
              <span>{label}</span>
              <ChevronRight />
            </button>
          ))}
        </div>

        {user && (
          <button
            onClick={onLogout}
            className="mt-auto mb-8 h-10 w-full shrink-0 rounded-full bg-ink text-sm text-paper"
          >
            退出登录
          </button>
        )}
      </div>
    </div>
  )
}