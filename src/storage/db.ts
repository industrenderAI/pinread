import type { Item, Language } from '../types/item'

/**
 * 存储层抽象。
 *
 * 现在用 localStorage 实现，方便在浏览器里快速开发调试。
 * 后续接入 Capacitor 打包成手机 App 时，把这个文件换成
 * @capacitor-community/sqlite 的实现即可，上层 hooks/组件代码不用改，
 * 因为它们只依赖下面这几个函数的签名。
 */

const ITEMS_KEY = 'language-notes:items'
const LANGUAGES_KEY = 'language-notes:languages'

export async function getItems(): Promise<Item[]> {
  const raw = localStorage.getItem(ITEMS_KEY)
  return raw ? (JSON.parse(raw) as Item[]) : []
}

export async function saveItems(items: Item[]): Promise<void> {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}


// export async function getLanguages(): Promise<Language[]> {
//   const raw = localStorage.getItem(LANGUAGES_KEY)
//   if (raw) return JSON.parse(raw) as Language[]
//   // 首次使用给一个默认分类，避免空列表体验突兀
//   const defaults: Language[] = [{ id: 'default', name: '英语' }]
//   await saveLanguages(defaults)
//   return defaults
// }

export async function getLanguages(): Promise<Language[]> {
  const raw = localStorage.getItem(LANGUAGES_KEY)
  if (raw) return JSON.parse(raw) as Language[]

  // 首次使用的默认语言
    const defaults: Language[] = [
      { id: 'english', name: 'English' },
      { id: 'japanese', name: '日本語' },
      { id: 'chinese', name: '中文' },
    ]

  await saveLanguages(defaults)
  return defaults
}

export async function saveLanguages(languages: Language[]): Promise<void> {
  localStorage.setItem(LANGUAGES_KEY, JSON.stringify(languages))
}
