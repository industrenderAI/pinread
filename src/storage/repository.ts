import type { Annotation, Item, Category } from '../types/item'

export interface ItemPatch {
  content: string
  source: string
  category: string
  annotations: Annotation[]
  updatedAt: number
}

/**
 * 数据仓库的统一接口。
 *
 * 未登录时用 localRepository（存 localStorage），登录后用
 * createCloudRepository(userId)（存 Supabase）。
 * 上层的 useItems / 组件代码完全不关心当前是本地还是云端，
 * 只依赖这些方法的签名。
 */
export interface Repository {
  getItems(): Promise<Item[]>
  getCategories(): Promise<Category[]>

  addItem(item: Item): Promise<void>
  updateItem(id: string, patch: ItemPatch): Promise<void>
  deleteItem(id: string): Promise<void>

  addAnnotation(itemId: string, annotation: Annotation, updatedAt: number): Promise<void>
  deleteAnnotation(itemId: string, annotationId: string, updatedAt: number): Promise<void>

  addCategory(category: Category): Promise<Category>
  updateCategory(id: string, name: string, color?: string): Promise<void>
  deleteCategory(id: string): Promise<void>

  /**
   * 把所有 category === oldName 的笔记，批量改成 newName。
   * newName 传空字符串 '' 表示"归到未分类"。
   * 用于：改分类名时同步旧笔记；删分类时把笔记安全移走，而不是留着一个不存在的分类名。
   */
  renameItemsCategory(oldName: string, newName: string): Promise<void>
}