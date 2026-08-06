import { useState } from 'react'
import type { User } from '../types/item'

type AuthResult = { error: string | null }

const CLOSE_ANIMATION_MS = 250

// 跟 LoginPage 保持一致的密码规则
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

/** 每一行设置项的外壳：左边标签+当前值，右边一个箭头/按钮，点击展开编辑区域 */
function SettingRow({
  label,
  value,
  expanded,
  onToggle,
  children,
}: {
  label: string
  value?: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="py-5">
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <div className="min-w-0">
          <p className="text-lg font-bold text-ink">{label}</p>
          {value && <p className="mt-0.5 truncate text-sm text-ink-faint">{value}</p>}
        </div>
        <div className={`shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight />
        </div>
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  )
}

const inputClass = 'h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm outline-none'
const primaryBtnClass =
  'h-11 w-full rounded-full bg-ink text-sm font-medium text-paper'

export function AccountPage({
  user,
  onBack,
  onUpdateName,
  onUpdateEmail,
  onUpdatePassword,
  onDeleteAccount,
}: {
  user: User | null
  onBack: () => void
  onUpdateName: (name: string) => Promise<AuthResult>
  onUpdateEmail: (email: string) => Promise<AuthResult>
  onUpdatePassword: (password: string) => Promise<AuthResult>
  onDeleteAccount: () => Promise<AuthResult>
}) {
  const [closing, setClosing] = useState(false)
  const [openRow, setOpenRow] = useState<'name' | 'email' | 'password' | null>(null)

  const [name, setName] = useState(user?.name ?? '')
  const [nameSubmitting, setNameSubmitting] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameNotice, setNameNotice] = useState<string | null>(null)

  const [newEmail, setNewEmail] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailNotice, setEmailNotice] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null)

  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const handleBack = () => {
    if (closing) return

    setClosing(true)

    setTimeout(() => {
      onBack()
    }, CLOSE_ANIMATION_MS)
  }

  const toggleRow = (row: 'name' | 'email' | 'password') => {
    setOpenRow((prev) => (prev === row ? null : row))
  }

  const handleSaveName = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('用户名不能为空')
      return
    }
    setNameError(null)
    setNameNotice(null)
    setNameSubmitting(true)
    const result = await onUpdateName(trimmed)
    setNameSubmitting(false)
    if (result.error) {
      setNameError(result.error)
      return
    }
    setNameNotice('已保存')
    setOpenRow(null)
  }

  const handleSaveEmail = async () => {
    const trimmed = newEmail.trim()
    if (!trimmed) {
      setEmailError('请输入新邮箱')
      return
    }
    if (trimmed === user?.email) {
      setEmailError('新邮箱和当前邮箱相同')
      return
    }
    setEmailError(null)
    setEmailNotice(null)
    setEmailSubmitting(true)
    const result = await onUpdateEmail(trimmed)
    setEmailSubmitting(false)
    if (result.error) {
      setEmailError(result.error)
      return
    }
    setEmailNotice(`确认邮件已分别发送到旧邮箱和 ${trimmed}，两边都点击确认后新邮箱才会生效`)
    setNewEmail('')
  }

  const handleSavePassword = async () => {
    const passwordErr = validatePassword(newPassword)
    if (passwordErr) {
      setPasswordError(passwordErr)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }
    setPasswordError(null)
    setPasswordNotice(null)
    setPasswordSubmitting(true)
    const result = await onUpdatePassword(newPassword)
    setPasswordSubmitting(false)
    if (result.error) {
      setPasswordError(result.error)
      return
    }
    setPasswordNotice('密码已更新')
    setNewPassword('')
    setConfirmPassword('')
    setOpenRow(null)
  }

  const handleDeleteAccount = async () => {
    setDeleteError(null)
    setDeleteSubmitting(true)
    const result = await onDeleteAccount()
    setDeleteSubmitting(false)
    if (result.error) {
      setDeleteError(result.error)
      return
    }
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
      ${
        closing
          ? 'page-slide-out'
          : 'page-slide-in'
      }
      `}
    >
      <div className="relative flex items-center px-4 py-4">
        <button
          onClick={handleBack}
          aria-label="Return"
          className="-m-3.5 flex items-center justify-center p-4"
        >
          <BackIcon className="w-4 h-4" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-lg font-bold">账号管理</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-4">
        {/* 昵称 */}
        <SettingRow
          label="用户名"
          value={user?.name}
          expanded={openRow === 'name'}
          onToggle={() => toggleRow('name')}
        >
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入新用户名"
              className={inputClass}
              autoFocus
            />
            <button onClick={handleSaveName} disabled={nameSubmitting} className={primaryBtnClass}>
              保存
            </button>
            {nameError && <p className="text-xs text-danger">{nameError}</p>}
          </div>
        </SettingRow>
        {nameNotice && !openRow && <p className="text-xs text-accent-text">{nameNotice}</p>}

        {/* 邮箱 */}
        <SettingRow
          label="邮箱"
          value={user?.email}
          expanded={openRow === 'email'}
          onToggle={() => toggleRow('email')}
        >
          <div className="flex flex-col gap-3">
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="输入新邮箱"
              type="email"
              className={inputClass}
              autoFocus
            />
            <button onClick={handleSaveEmail} disabled={emailSubmitting} className={primaryBtnClass}>
              发送确认邮件
            </button>
            {emailError && <p className="text-xs text-danger">{emailError}</p>}
            {emailNotice && <p className="text-xs text-accent-text">{emailNotice}</p>}
          </div>
        </SettingRow>

        {/* 密码 */}
        <SettingRow
          label="密码"
          value="••••••••"
          expanded={openRow === 'password'}
          onToggle={() => toggleRow('password')}
        >
          <div className="flex flex-col gap-3">
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="设置新密码"
              type="password"
              maxLength={16}
              className={inputClass}
              autoFocus
            />
            <p className="-mt-1 text-xs text-ink-faint">
              8-16 位，需包含大小写字母和数字，可用符号：{ALLOWED_SPECIAL_CHARS}
            </p>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="确认新密码"
              type="password"
              maxLength={16}
              className={inputClass}
            />
            <button
              onClick={handleSavePassword}
              disabled={passwordSubmitting}
              className={primaryBtnClass}
            >
              保存新密码
            </button>
            {passwordError && <p className="text-xs text-danger">{passwordError}</p>}
          </div>
        </SettingRow>
        {passwordNotice && !openRow && (
          <p className="pt-2 text-xs text-accent-text">{passwordNotice}</p>
        )}

        {/* 注销账号 */}
        <div className="mt-auto mb-8 pt-8">
          {deleteStep === 'idle' ? (
            <button
              onClick={() => {
                setDeleteStep('confirm')
                setDeleteError(null)
              }}
              className={primaryBtnClass}
            >
              注销账号
            </button>
          ) : (
            <div className="rounded-lg border border-line p-4 mb-4 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.10)]">
              <p className="text-lg font-bold text-ink">确定注销账号吗？</p>
              <p className="mt-2 text-xs text-ink-faint">
                注销后账号和所有数据将会被永久删除，无法恢复。
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteSubmitting}
                  className="h-9 flex-1 rounded-full bg-danger text-xs text-paper disabled:opacity-50"
                >
                  是
                </button>
                <button
                  onClick={() => setDeleteStep('idle')}
                  className="h-9 flex-1 rounded-full border border-line text-xs text-ink"
                >
                  否
                </button>
              </div>
              {deleteError && <p className="mt-2 text-xs text-danger">{deleteError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}