import { useState } from 'react'
import type { User } from '../types/item'
import { Avatar } from './Avatar'

// 要跟 index.css 里 .page-slide-out 的动画时长对上，
// 不然会出现"页面已经滑走但还没真正切回首页"或者相反的情况。
const CLOSE_ANIMATION_MS = 250

const MENU_ITEMS = [
  {
    label:'账号管理',
    action:'account',
  },
  {
    label:'云同步',
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
    label:'关于Pinread',
    action:'about',
  },
]

function BackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19.93 27.53" className={className} fill="currentColor">
      <path d="M18.93,27.53c-.21,0-.42-.06-.59-.2L0,13.77,18.34.2c.44-.33,1.07-.24,1.4.21.33.44.24,1.07-.21,1.4L3.36,13.77l16.17,11.96c.44.33.54.95.21,1.4-.2.27-.5.41-.8.41Z" />
    </svg>
  )
}

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
    onSyncClick,
    onAboutClick,
    onHelpClick,
  }: {
    user: User | null
    onBack: () => void
    onLogout: () => void
    onLoginClick: () => void
    onCategoryClick: () => void
    onAccountClick: () => void
    onSyncClick: () => void
    onAboutClick: () => void
    onHelpClick: () => void
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
          className="-m-3.5 flex items-center justify-center p-4"
        >
          <BackIcon className="w-4 h-4" />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-lg font-bold">个人中心</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto bg">
        {user ? (
          <div className="flex items-center gap-5 bg-paper py-8 px-4">
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

        <div className="mb-8 mt-2 flex flex-col px-4">
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
                  if (item.action === 'sync') {
                  onSyncClick()
                }
                  if (item.action === 'about') {
                  onAboutClick()
                }
               if (item.action === 'help') {
                  onHelpClick()
                }
              }}
              className="flex items-center justify-between py-5 text-left text-lg text-ink font-bold"
            >
              <span>{item.label}</span>
              <ChevronRight />
            </button>
          ))}
        </div>

        {user && (
          <div className='mt-auto my-12 px-5'>
              <button
                onClick={onLogout}
                className="h-11 w-full rounded-full bg-ink text-sm font-medium text-paper  active:bg-ink/80"
              >
                退出登录
              </button>
          </div>
        )}
      </div>
    </div>
  )
}