import type { Item, Category } from '../types/item'
import type { Repository } from './repository'

const ITEMS_KEY = 'language-notes:items'
const CATEGORIES_KEY = 'pinread:categories'

function readItems(): Item[] {
  const raw = localStorage.getItem(ITEMS_KEY)
  return raw ? (JSON.parse(raw) as Item[]) : []
}

function writeItems(items: Item[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

function readCategories(): Category[] | null {
  const raw = localStorage.getItem(CATEGORIES_KEY)
  return raw ? (JSON.parse(raw) as Category[]) : null
}

function writeCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

export const localRepository: Repository = {
  async getItems() {
    return readItems()
  },

  async getCategories() {
    return readCategories() ?? []
  },

  async addItem(item) {
    writeItems([
      ...readItems(),
      item,
    ])
  },

  async updateItem(id, patch) {
    writeItems(
      readItems().map((it) =>
        it.id === id
          ? { ...it, ...patch }
          : it,
      ),
    )
  },

  async deleteItem(id) {
    writeItems(
      readItems().filter(
        (it) => it.id !== id,
      ),
    )
  },

  async addAnnotation(itemId, annotation, updatedAt) {
    writeItems(
      readItems().map((it) =>
        it.id === itemId
          ? {
              ...it,
              annotations: [
                ...it.annotations,
                annotation,
              ],
              updatedAt,
            }
          : it,
      ),
    )
  },

  async deleteAnnotation(itemId, annotationId, updatedAt) {
    writeItems(
      readItems().map((it) =>
        it.id === itemId
          ? {
              ...it,
              annotations: it.annotations.filter(
                (a) => a.id !== annotationId,
              ),
              updatedAt,
            }
          : it,
      ),
    )
  },

  async addCategory(category) {
    writeCategories([
      ...(readCategories() ?? []),
      category,
    ])

    // 返回新创建的分类
    return category
  },

  async updateCategory(id, name, color) {
    writeCategories(
      (readCategories() ?? []).map((category) =>
        category.id === id
          ? {
              ...category,
              name,
              color,
            }
          : category,
      ),
    )
  },

  async deleteCategory(id) {
    writeCategories(
      (readCategories() ?? []).filter(
        (category) => category.id !== id,
      ),
    )
  },

  async renameItemsCategory(oldName, newName) {
    writeItems(
      readItems().map((it) =>
        it.category === oldName
          ? { ...it, category: newName }
          : it,
      ),
    )
  },
}