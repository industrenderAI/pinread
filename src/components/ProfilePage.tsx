import { useState } from 'react'
import type { User } from '../types/item'
import { Avatar } from './Avatar'

const MENU_ITEMS = ['账号', '同步', '语言', '帮助', '关于']

type AuthResult = { error: string | null }

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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 7.9-11.3 7.9-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.1-5.1C33.5 6 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 5.9 4.3C13.8 15.6 18.5 12.4 24 12.4c3.1 0 5.8 1.1 8 3l5.1-5.1C33.5 6.6 29 4.4 24 4.4c-7.6 0-14.1 4.3-17.7 10.3z"
      />
      <path
        fill="#4CAF50"
        d="M24 44.4c4.9 0 9.4-1.9 12.7-4.9l-5.9-5c-2 1.4-4.6 2.2-6.8 2.2-5.3 0-9.7-3.3-11.3-7.9l-5.8 4.5C10 40.1 16.5 44.4 24 44.4z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.2-2.2 4.1-4.1 5.5l5.9 5C40.9 34.9 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  )
}

export function ProfilePage({
  user,
  onBack,
  onLogout,
  onSignUpWithPassword,
  onSignInWithPassword,
  onSendOtp,
  onVerifyOtp,
  onSignInWithGoogle,
}: {
  user: User | null
  onBack: () => void
  onLogout: () => void
  onSignUpWithPassword: (email: string, password: string, name: string) => Promise<AuthResult>
  onSignInWithPassword: (email: string, password: string) => Promise<AuthResult>
  onSendOtp: (email: string) => Promise<AuthResult>
  onVerifyOtp: (email: string, token: string) => Promise<AuthResult>
  onSignInWithGoogle: () => Promise<AuthResult>
}) {
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [tab, setTab] = useState<'password' | 'otp'>('password')
  const [isRegister, setIsRegister] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const resetFeedback = () => {
    setError(null)
    setNotice(null)
  }

  const handlePasswordSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('请填写邮箱和密码')
      return
    }
    resetFeedback()
    setSubmitting(true)
    const result = isRegister
      ? await onSignUpWithPassword(email.trim(), password, name)
      : await onSignInWithPassword(email.trim(), password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (isRegister) {
      setNotice('注册请求已发送，请查收邮箱完成验证后登录')
    }
  }

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('请先填写邮箱')
      return
    }
    resetFeedback()
    setSubmitting(true)
    const result = await onSendOtp(email.trim())
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setOtpSent(true)
    setNotice('验证码已发送，请查收邮箱')
  }

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError('请输入验证码')
      return
    }
    resetFeedback()
    setSubmitting(true)
    const result = await onVerifyOtp(email.trim(), otpCode.trim())
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    }
  }

  const handleGoogle = async () => {
    resetFeedback()
    setSubmitting(true)
    const result = await onSignInWithGoogle()
    setSubmitting(false)
    if (result.error) setError(result.error)
    // 成功的话浏览器会直接跳转去 Google，不会走到这里
  }

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
              onClick={() => {
                setShowLoginForm((v) => !v)
                resetFeedback()
              }}
              className="h-8 shrink-0 rounded-full bg-ink px-4 text-xs font-medium text-paper"
            >
              点击登录
            </button>
          </div>
        )}

        {!user && showLoginForm && (
          <div className="mt-4 rounded-lg border border-line bg-paper-card p-3">
            <div className="flex gap-4 border-b border-line pb-2 text-sm">
              <button
                onClick={() => {
                  setTab('password')
                  resetFeedback()
                }}
                className={tab === 'password' ? 'font-medium text-ink' : 'text-ink-faint'}
              >
                密码登录
              </button>
              <button
                onClick={() => {
                  setTab('otp')
                  resetFeedback()
                }}
                className={tab === 'otp' ? 'font-medium text-ink' : 'text-ink-faint'}
              >
                验证码登录
              </button>
            </div>

            {tab === 'password' ? (
              <div className="mt-3 flex flex-col gap-2">
                {isRegister && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="给自己起个名字"
                    className="h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
                  />
                )}
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱"
                  type="email"
                  className="h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="密码"
                  type="password"
                  className="h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
                />
                <button
                  onClick={handlePasswordSubmit}
                  disabled={submitting}
                  className="h-10 w-full rounded-lg bg-ink text-sm text-paper disabled:opacity-50"
                >
                  {isRegister ? '注册' : '登录'}
                </button>
                <button
                  onClick={() => {
                    setIsRegister((v) => !v)
                    resetFeedback()
                  }}
                  className="text-xs text-ink-faint"
                >
                  {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
                </button>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱"
                  type="email"
                  disabled={otpSent}
                  className="h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none disabled:opacity-50"
                />
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={submitting}
                    className="h-10 w-full rounded-lg bg-ink text-sm text-paper disabled:opacity-50"
                  >
                    发送验证码
                  </button>
                ) : (
                  <>
                    <input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                      placeholder="6 位验证码"
                      inputMode="numeric"
                      autoFocus
                      className="h-10 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={submitting}
                      className="h-10 w-full rounded-lg bg-ink text-sm text-paper disabled:opacity-50"
                    >
                      验证并登录
                    </button>
                    <button
                      onClick={() => {
                        setOtpSent(false)
                        setOtpCode('')
                        resetFeedback()
                      }}
                      className="text-xs text-ink-faint"
                    >
                      重新发送
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              onClick={handleGoogle}
              disabled={submitting}
              className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm text-ink disabled:opacity-50"
            >
              <GoogleIcon />
              使用 Google 登录
            </button>

            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
            {notice && <p className="mt-2 text-xs text-accent-text">{notice}</p>}
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
