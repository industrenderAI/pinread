import { useState } from 'react'
import type { User } from '../types/item'
import { Avatar } from './Avatar'

// 要跟 index.css 里 .page-slide-out 的动画时长对上，
// 不然会出现"页面已经滑走但还没真正切回首页"或者相反的情况。
const CLOSE_ANIMATION_MS = 250

const MENU_ITEMS = [
  {
    label:'账户管理',
    action:'account',
  },
  {
    label:'同步设定',
    action:'sync',
  },
  {
    label:'分类管理',
    action:'category',
  },
  {
    label:'系统语言',
    action:'language',
  },
  {
    label:'帮助中心',
    action:'help',
  },
  {
    label:'关于我们',
    action:'about',
  },
]

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
    onCategoryClick,
    onAccountClick,
  }: {
    user: User | null
    onBack: () => void
    onLogout: () => void
    onLoginClick: () => void
    onCategoryClick: () => void
    onAccountClick: () => void
  }) {

 const [closing, setClosing] = useState(false)

  // 返回按钮走这里：先播放"往右滑出"的动画，动画播完了
  // 再真正调用 onBack，让 App.tsx 把 view 切回首页。
  const handleBack = () => {
    if (closing) return
    setClosing(true)
    setTimeout(onBack, CLOSE_ANIMATION_MS)
  }

  return (
        <div
      className={`fixed inset-0 z-20 mx-auto flex max-w-lg flex-col bg-paper ${
        closing ? 'page-slide-out' : 'page-slide-in'
      }`}
    >
      <div className="relative flex items-center px-4 py-4">
        <button
          onClick={handleBack}
          aria-label="Back"
          className="-m-3.5 flex items-center justify-center p-4 text-accent-text"
        >
          <img
            src="/icons/back.svg"
            className="w-3 h-auto"
            alt="Return to previous page"
          />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-lg font-bold">个人中心</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {user ? (
          <div className="flex items-center gap-5">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-ink">{user.name}</p>
              <p className="truncate text-sm text-ink-faint">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center gap-3  py-4 px-4"> 
            <Avatar user={null} size="md" />
            <button
              onClick={onLoginClick}
              className="h-8 shrink-0 rounded-full bg-ink px-4 text-xs font-bold text-paper"
            >
              点击登录
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col px-4">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.action}
              onClick={() => {
                if (item.action === 'category') {
                  onCategoryClick()
                }
                if (item.action === 'account') {
                  if (!user) {
                    onLoginClick()
                    return
                  }
                  onAccountClick()
                }
              }}
              className="flex items-center justify-between py-4 text-left text-lg text-ink font-bold"
            >
              <span>{item.label}</span>
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