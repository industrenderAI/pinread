import { useCallback, useState } from 'react'
import type { User } from '../types/item'

/**
 * 这是一个本地模拟的登录状态，没有真正的服务器和密码校验，
 * 只是先把"登录/未登录"这个状态跑通。以后接入真正的账号系统
 * （比如 Supabase Auth）时，把这个 hook 的实现换掉即可，
 * login/logout 的调用方式（组件那边的代码）不用变。
 */

const KEY = 'pinread:user'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(loadUser)

  const login = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const next: User = { id: uid(), name: trimmed }
    localStorage.setItem(KEY, JSON.stringify(next))
    setUser(next)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  return { user, login, logout }
}
