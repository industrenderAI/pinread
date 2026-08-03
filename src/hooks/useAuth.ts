import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { User } from '../types/item'

/** 把 Supabase 的 session 转换成组件用的 User（顺便去 profiles 表拿昵称/头像）。 */
async function sessionToUser(session: Session | null): Promise<User | null> {
  const authUser = session?.user
  if (!authUser) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar')
    .eq('id', authUser.id)
    .maybeSingle()

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: profile?.name || authUser.email?.split('@')[0] || '用户',
    avatar: profile?.avatar ?? undefined,
  }
}

type AuthResult = { error: string | null }

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const nextUser = await sessionToUser(session)
      if (cancelled) return
      setUser(nextUser)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = await sessionToUser(session)
      if (cancelled) return
      setUser(nextUser)
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  /** 邮箱 + 密码注册 */
  const signUpWithPassword = useCallback(
    async (email: string, password: string, name: string): Promise<AuthResult> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() || email.split('@')[0] } },
      })
      return { error: error?.message ?? null }
    },
    [],
  )

  /** 邮箱 + 密码登录 */
  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },
    [],
  )

  /** 发送邮箱验证码（6 位数字，需要在 Supabase 后台把邮件模板改成包含 {{ .Token }}） */
  const sendOtp = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    return { error: error?.message ?? null }
  }, [])

  /** 校验刚才发送的邮箱验证码，成功后即登录/注册完成 */
  const verifyOtp = useCallback(async (email: string, token: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    return { error: error?.message ?? null }
  }, [])

  /** Google 第三方登录，会整页跳转到 Google，登录完成后跳回来 */
  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return { error: error?.message ?? null }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  /** 修改昵称：只改 profiles 表，不涉及 auth.users，改完立刻同步到本地 user 状态 */
  const updateName = useCallback(async (name: string): Promise<AuthResult> => {
    const trimmed = name.trim()
    if (!trimmed) return { error: '用户名不能为空' }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) return { error: '请先登录' }

    const { error } = await supabase.from('profiles').update({ name: trimmed }).eq('id', authUser.id)
    if (error) return { error: error.message }

    setUser((u) => (u ? { ...u, name: trimmed } : u))
    return { error: null }
  }, [])

  /**
   * 更换邮箱：Supabase 会分别给旧邮箱和新邮箱发确认信，
   * 都点击确认后邮箱才会真正切换，这里只是发起请求。
   */
  const updateEmail = useCallback(async (email: string): Promise<AuthResult> => {
    const trimmed = email.trim()
    if (!trimmed) return { error: '请输入新邮箱' }

    const { error } = await supabase.auth.updateUser({ email: trimmed })
    return { error: error?.message ?? null }
  }, [])

  /** 修改密码：已登录状态下直接设置新密码，不需要验证旧密码 */
  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }, [])

  /**
   * 注销账号：真正删除用户必须用 service_role 权限调用，
   * 这个密钥不能出现在前端浏览器代码里（会被任何人看到），
   * 所以这里先占位，等后端（Supabase Edge Function）接口就绪后再对接。
   */
  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    return { error: '注销账号功能正在开发中，暂未开放' }
  }, [])

  return {
      user,
      loading,
      signUpWithPassword,
      signInWithPassword,
      sendOtp,
      verifyOtp,
      signInWithGoogle,
      logout,
      updateName,
      updateEmail,
      updatePassword,
      deleteAccount,
    }
  }
