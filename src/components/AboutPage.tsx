import { useState } from 'react'

const CLOSE_ANIMATION_MS = 250

function BackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 19.93 27.53" className={className} fill="currentColor">
      <path d="M18.93,27.53c-.21,0-.42-.06-.59-.2L0,13.77,18.34.2c.44-.33,1.07-.24,1.4.21.33.44.24,1.07-.21,1.4L3.36,13.77l16.17,11.96c.44.33.54.95.21,1.4-.2.27-.5.41-.8.41Z" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  )
}

export function AboutPage({
  onBack,
}: {
  onBack: () => void
}) {
  const [closing, setClosing] = useState(false)

  const handleBack = () => {
    if (closing) return
    setClosing(true)
    setTimeout(() => {
      onBack()
    }, CLOSE_ANIMATION_MS)
  }

  // 模拟跳转应用商店/网页的方法
  const handleRateApp = () => {
    // 以后替换为对应的 App Store 或 Google Play 链接
    window.open('https://apps.apple.com', '_blank')
  }

  const handleOpenFeatures = () => {
    // 以后替换为功能介绍网页链接
    window.open('https://pinread.com/features', '_blank')
  }

  const handleCheckUpdate = () => {
    // 以后替换为对应的应用商店更新链接
    window.open('https://apps.apple.com', '_blank')
  }

  return (
    <div
      className={`
      fixed
      inset-0
      z-30
      mx-auto
      flex
      max-w-lg
      flex-col
      bg-paper
      ${closing ? 'page-slide-out' : 'page-slide-in'}
      `}
    >
      {/* Header */}
      <div className="relative flex items-center px-4 py-5 shrink-0">
        <button
          onClick={handleBack}
          aria-label="Return"
          className="-m-3.5 flex items-center justify-center p-4 z-10"
        >
          <BackIcon className="w-4 h-4" />
        </button>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold pointer-events-none">
          关于 PinRead
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col justify-between">
        <div>
          {/* Logo + 名称 + Slogan + 版本号 */}
          <div className="flex flex-col items-center pt-2">
            <img
              src="/icons/logo-color.svg"
              alt="PinRead Logo"
              className="w-24 h-24 rounded-3xl object-contain"
            />
            <h2 className="mt-5 text-3xl font-bold">
              PinRead
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Make reading part of learning.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Version 1.0.0
            </p>
          </div>

          {/* 核心操作菜单列表 */}
          <div className="mt-10 rounded-2xl bg-card overflow-hidden">
            <MenuItem
              icon={<StarIcon />}
              title="评分"
              onClick={handleRateApp}
            />
            <MenuItem
              icon={<InfoIcon />}
              title="功能介绍"
              onClick={handleOpenFeatures}
            />
            <MenuItem
              icon={<RefreshIcon />}
              title="版本更新"
              onClick={handleCheckUpdate}
            />
          </div>
        </div>

        {/* 底部政策协议与版权信息 */}
        <div className="mt-12 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-4 mb-3">
            <a href="#" className="hover:underline hover:text-foreground transition-colors">
              隐私政策
            </a>
            <span className="text-border">|</span>
            <a href="#" className="hover:underline hover:text-foreground transition-colors">
              服务条款
            </a>
          </div>
          <p>© 2026 PinRead</p>
        </div>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="
      w-full
      flex
      items-center
      justify-between
      px-5
      py-4
      hover:bg-accent/50
      transition-colors
      text-left
      "
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-sm font-medium">
          {title}
        </span>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
    </button>
  )
}