import type { Annotation, Item, Language } from '../types/item'

export interface ItemPatch {
  content: string
  source: string
  language: string
  annotations: Annotation[]
  updatedAt: number
}

/**
 * 数据仓库的统一接口。
 *
 * 未登录时用 localRepository（存 localStorage），登录后用
 * createCloudRepository(userId)（存 Supabase）。上层的 useItems /
 * 组件代码完全不关心当前是本地还是云端，只依赖这几个方法的签名。
 */
export interface Repository {
  getItems(): Promise<Item[]>
  getLanguages(): Promise<Language[]>
  addItem(item: Item): Promise<void>
  updateItem(id: string, patch: ItemPatch): Promise<void>
  deleteItem(id: string): Promise<void>
  addAnnotation(itemId: string, annotation: Annotation, updatedAt: number): Promise<void>
  deleteAnnotation(itemId: string, annotationId: string, updatedAt: number): Promise<void>
  addLanguage(language: Language): Promise<void>
}
