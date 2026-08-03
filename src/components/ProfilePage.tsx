import type { User } from '../types/item'
import { Avatar } from './Avatar'

const MENU_ITEMS = ['账号', '同步',  '分类','系统语言', '帮助', '关于']

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
  onLogout,
  onLoginClick,
}: {
  user: User | null
  onBack: () => void
  onLogout: () => void
  onLoginClick: () => void
}) {
  return (
    <div className="fixed inset-0 z-20 mx-auto flex max-w-lg flex-col bg-paper">
      <div className="relative flex items-center border-b border-line px-4 py-3.5">
        <button onClick={onBack} className="text-[15px] text-accent-text">
          <img src="/icons/back.svg" alt="PinRead_Return" className="h-4 w-auto" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-base font-medium">个人中心</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-6">
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-faint">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar user={null} size="md" />
            <button
              onClick={onLoginClick}
              className="h-8 shrink-0 rounded-full bg-ink px-4 text-xs font-medium text-paper"
            >
              点击登录
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col divide-y divide-line border-t border-b border-line">
          {MENU_ITEMS.map((label) => (
            <button
              key={label}
              className="flex items-center justify-between py-3.5 text-left text-sm text-ink"
            >
              <span>{label}</span>
              <ChevronRight />
            </button>
          ))}
        </div>

        {user && (
          <button
            onClick={onLogout}
            className="mt-auto mb-8 h-12 w-full shrink-0 rounded-full bg-ink text-sm text-paper"
          >
            退出登录
          </button>
        )}
      </div>
    </div>
  )
}