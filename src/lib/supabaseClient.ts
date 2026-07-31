import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '缺少 Supabase 环境变量：请在项目根目录创建 .env 文件，参考 .env.example 填入 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 默认就是 true，写出来方便理解：邮箱验证码/Google 登录跳转回来后，
    // supabase-js 会自动从 URL 里读出 session，不需要我们自己解析。
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
})
