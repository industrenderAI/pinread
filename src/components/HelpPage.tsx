import { useState } from 'react'

const CLOSE_ANIMATION_MS = 250

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

/** 常见问题问答组件 */
function FAQItem({
  question,
  answer,
  expanded,
  onToggle,
}: {
  question: string
  answer: React.ReactNode
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="py-4">
      <button onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <p className="text-base font-bold text-ink pr-2">{question}</p>
        <div className={`shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight />
        </div>
      </button>
      {expanded && (
        <div className="mt-3 text-sm leading-relaxed text-ink-soft">
          {answer}
        </div>
      )}
    </div>
  )
}

/** 预设的常见问题数据 */
const FAQ_LIST = [
  {
    id: 'email-change',
    question: '修改邮箱后为什么没有立刻生效？',
    answer: '出于账号安全考虑，修改邮箱后系统会分别向您的原邮箱和新邮箱发送确认邮件。只有当两边均点击确认链接后，新邮箱才会正式生效。',
  },
  {
    id: 'password-rules',
    question: '设置新密码有哪些格式要求？',
    answer: '密码长度需在 8 - 16 位之间，且必须同时包含大写字母、小写字母和数字。仅允许使用 . 和 _ 两种特殊符号。',
  },
  {
    id: 'account-delete',
    question: '注销账号后数据还能恢复吗？',
    answer: '无法恢复。账号一旦注销，该账号下的所有个人数据和使用记录都将被永久彻底清除，请谨慎操作。',
  },
  {
    id: 'no-email',
    question: '收不到验证邮件或确认邮件怎么办？',
    answer: '1. 请检查邮件是否被归类到了垃圾邮件箱或订阅邮件文件夹中；\n2. 确认输入的邮箱地址无误；\n3. 如果依然无法收到，请尝试等待几分钟后重新发送，或通过官方邮箱联系我们。',
  },
]

export function HelpPage({
  onBack,
  contactEmail = 'support@example.com',
}: {
  onBack: () => void
  contactEmail?: string
}) {
  const [closing, setClosing] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleBack = () => {
    if (closing) return
    setClosing(true)
    setTimeout(() => {
      onBack()
    }, CLOSE_ANIMATION_MS)
  }

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

const handleCopyEmail = () => {
  const textarea = document.createElement('textarea')
  textarea.value = contactEmail
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy') // 兼容所有环境的复制命令
  document.body.removeChild(textarea)

  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
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
      {/* 顶部 Header */}
      <div className="relative flex items-center px-4 py-4">
        <button
          onClick={handleBack}
          aria-label="Return"
          className="-m-3.5 flex items-center justify-center p-4"
        >
          <BackIcon className="w-4 h-4" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="text-lg font-bold">帮助中心</span>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-2 mt-8">
        <p className="text-xl font-bold text-ink uppercase tracking-wider mb-4">
          常见问题 FAQ
        </p>

        {/* FAQ 列表 */}
        <div className="flex flex-col">
          {FAQ_LIST.map((item) => (
            <FAQItem
              key={item.id}
              question={item.question}
              answer={
                <span className="whitespace-pre-line">{item.answer}</span>
              }
              expanded={openId === item.id}
              onToggle={() => toggleFAQ(item.id)}
            />
          ))}
        </div>

        {/* 底部联系客服卡片 */}
        <div className="mt-auto mb-12 pt-8">
            <p className="text-base font-bold text-ink">仍需帮助？</p>
            <p className="mt-1 text-xs text-ink-faint">
              如果以上解答未能解决您的问题，欢迎随时发送邮件联系我们。
            </p>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-paper px-3 py-2.5 border border-line">
              <span className="text-xs font-medium text-ink truncate mr-2">
                {contactEmail}
              </span>
              <button
                onClick={handleCopyEmail}
                className={`shrink-0 text-xs font-bold transition-all ${
                  copied ? 'text-accent-text scale-105' : 'text-ink hover:opacity-70'
                }`}
              >
                {copied ? '已复制！' : '复制邮箱'}
              </button>
            </div>
        </div>
      </div>
    </div>
  )
}