import { useState } from 'react'
import type { User } from '../types/item'

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

  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-lg flex-col bg-paper">
        <div className="relative flex items-center border-b border-line px-4 py-3.5">
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
      {user ? (
        <div className="flex flex-1 flex-col items-center px-8 pt-12">
          <img
            src={user.avatar || '/icons/profile.svg'}
            alt={user.name}
            className="h-20 w-20 rounded-full object-cover"
          />
          <p className="mt-4 text-lg font-medium text-ink">{user.name}</p>
          <p className="mt-1 text-xs text-ink-faint">本地账号（尚未接入云同步）</p>

          <button
            onClick={onLogout}
            className="mt-10 h-11 w-full rounded-lg border border-line text-sm text-danger"
          >
            退出登录
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center px-8 pt-14">
            <img
              src="/icons/profile.svg"
              alt="default_avatar"
              className="h-20 w-20 rounded-full"
            />          
            <p className="mt-4 text-center text-sm leading-relaxed text-ink-soft">
            登录
            <br />
            <span className="text-ink-faint text-xs">（可以在多台设备间同步你的笔记.当前是本地体验版，数据仅存在这台设备上）</span>
          </p>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="给自己起个名字"
            className="mt-6 h-11 w-full rounded-lg border border-line bg-paper-card px-3 text-sm outline-none"
          />
          <button
            onClick={() => onLogin(name)}
            className="mt-3 h-11 w-full rounded-lg bg-accent text-sm text-on-accent"
          >
            登录 / 注册
          </button>
        </div>
      )}
    </div>
  )
}
