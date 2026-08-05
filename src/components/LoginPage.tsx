import { useState } from 'react'

type AuthResult = { error: string | null }

// 允许出现在密码里的特殊符号：只开放 . 和 _ 这两个最常见、
// 不会在 URL / 邮件模板 / 复制粘贴中引起歧义的符号，其他一律拒绝。
const ALLOWED_SPECIAL_CHARS = '._'
const PASSWORD_ALLOWED_REGEX = /^[A-Za-z0-9._]+$/

function validatePassword(password: string): string | null {
  if (password.length < 8) return '密码至少需要 8 位'
  if (password.length > 16) return '密码最多 16 位'
  if (!/[A-Z]/.test(password)) return '密码需要包含至少一个大写字母'
  if (!/[a-z]/.test(password)) return '密码需要包含至少一个小写字母'
  if (!/[0-9]/.test(password)) return '密码需要包含至少一个数字'
  if (!PASSWORD_ALLOWED_REGEX.test(password)) {
    return `密码包含非法字符，只能使用字母、数字和符号：${ALLOWED_SPECIAL_CHARS}`
  }
  return null
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

/**
 * 独立的登录/注册页面（原来是在 ProfilePage 里内联展开的一个表单，
 * 现在拆成单独一屏，点击"点击登录"整页跳转过来，登录成功后 App
 * 会自动把 view 切回个人中心）。
 */
export function LoginPage({
  onBack,
  onSuccess,
  onSignUpWithPassword,
  onSignInWithPassword,
  onSendOtp,
  onVerifyOtp,
  onSignInWithGoogle,
}: {
  onBack: () => void
  onSuccess: () => void
  onSignUpWithPassword: (email: string, password: string, name: string) => Promise<AuthResult>
  onSignInWithPassword: (email: string, password: string) => Promise<AuthResult>
  onSendOtp: (email: string) => Promise<AuthResult>
  onVerifyOtp: (email: string, token: string) => Promise<AuthResult>
  onSignInWithGoogle: () => Promise<AuthResult>
}) {
  const [tab, setTab] = useState<'password' | 'otp'>('password')
  const [isRegister, setIsRegister] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
    if (isRegister) {
      if (!name.trim()) {
        setError('请填写用户名')
        return
      }
      const passwordError = validatePassword(password)
      if (passwordError) {
        setError(passwordError)
        return
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }
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
      return
    }
    onSuccess()
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
      return
    }
    onSuccess()
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
    <div className="fixed inset-0 z-30 mx-auto flex max-w-lg flex-col bg-paper">
      <div className="relative flex items-center border-b border-line px-4 py-3.5">
        <button onClick={onBack} className="text-[15px] text-accent-text">
          <img src="/icons/back.svg" alt="PinRead_Return" className="h-4 w-auto" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-base font-medium">{isRegister ? '注册' : '登录'}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-6 text-sm">
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
            <div className="flex flex-col gap-3">
              {isRegister && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="给自己起个名字（必填）"
                  className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
                />
              )}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱"
                type="email"
                autoFocus
                className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => !isRegister && e.key === 'Enter' && handlePasswordSubmit()}
                placeholder={isRegister ? '设置密码' : '密码'}
                type="password"
                maxLength={isRegister ? 16 : undefined}
                className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
              />
              {isRegister && (
                <p className="-mt-1 text-xs text-ink-faint">
                  8-16 位，需包含大小写字母和数字，可用符号：{ALLOWED_SPECIAL_CHARS}
                </p>
              )}
              {isRegister && (
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="确认密码"
                  type="password"
                  maxLength={16}
                  className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
                />
              )}
              <button
                onClick={handlePasswordSubmit}
                disabled={submitting}
                className="h-11 w-full rounded-full bg-ink text-sm font-medium text-paper active:bg-ink/80"
              >
                {isRegister ? '注册' : '登录'}
              </button>
              <button
                onClick={() => {
                  setIsRegister((v) => !v)
                  setConfirmPassword('')
                  resetFeedback()
                }}
                className="text-xs text-ink-faint"
              >
                {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱"
                type="email"
                autoFocus
                disabled={otpSent}
                className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
              />
              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={submitting}
                  className="h-11 w-full rounded-full bg-ink text-sm font-medium text-paper active:bg-ink/80"
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
                    className="h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={submitting}
                    className="h-11 w-full rounded-full bg-ink text-sm font-medium text-paper active:bg-ink/80"
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

          <div className="my-1 flex items-center gap-3 text-xs text-ink-faint">
            <div className="h-px flex-1 bg-line" />
            <span>或</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm text-ink "
          >
            <GoogleIcon />
            使用 Google 登录
          </button>

          {error && <p className="text-xs text-danger">{error}</p>}
          {notice && <p className="text-xs text-accent-text">{notice}</p>}
        </div>
      </div>
    </div>
  )
}