import type { Item, Language } from '../types/item'
import type { Repository } from './repository'

const ITEMS_KEY = 'language-notes:items'
const LANGUAGES_KEY = 'language-notes:languages'

function readItems(): Item[] {
  const raw = localStorage.getItem(ITEMS_KEY)
  return raw ? (JSON.parse(raw) as Item[]) : []
}

function writeItems(items: Item[]): void {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

function readLanguages(): Language[] | null {
  const raw = localStorage.getItem(LANGUAGES_KEY)
  return raw ? (JSON.parse(raw) as Language[]) : null
}

function writeLanguages(languages: Language[]): void {
  localStorage.setItem(LANGUAGES_KEY, JSON.stringify(languages))
}

export const localRepository: Repository = {
  async getItems() {
    return readItems()
  },

  async getLanguages() {
    const existing = readLanguages()
    if (existing) return existing
    // 首次使用的默认语言
    const defaults: Language[] = [
      { id: 'english', name: 'English' },
      { id: 'japanese', name: '日本語' },
      { id: 'chinese', name: '中文' },
    ]
    writeLanguages(defaults)
    return defaults
  },

  async addItem(item) {
    writeItems([...readItems(), item])
  },

  async updateItem(id, patch) {
    writeItems(readItems().map((it) => (it.id === id ? { ...it, ...patch } : it)))
  },

  async deleteItem(id) {
    writeItems(readItems().filter((it) => it.id !== id))
  },

  async addAnnotation(itemId, annotation, updatedAt) {
    writeItems(
      readItems().map((it) =>
        it.id === itemId
          ? { ...it, annotations: [...it.annotations, annotation], updatedAt }
          : it,
      ),
    )
  },

  async deleteAnnotation(itemId, annotationId, updatedAt) {
    writeItems(
      readItems().map((it) =>
        it.id === itemId
          ? { ...it, annotations: it.annotations.filter((a) => a.id !== annotationId), updatedAt }
          : it,
      ),
    )
  },

  async addLanguage(language) {
    writeLanguages([...(readLanguages() ?? []), language])
  },
}
