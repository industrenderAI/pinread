import { useCallback, useEffect, useState } from 'react'
import type { Annotation, Item, Language } from '../types/item'
import * as db from '../storage/db'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [loadedItems, loadedLanguages] = await Promise.all([
        db.getItems(),
        db.getLanguages(),
      ])
      setItems(loadedItems)
      setLanguages(loadedLanguages)
      setLoading(false)
    })()
  }, [])

  const persist = useCallback(async (next: Item[]) => {
    setItems(next)
    await db.saveItems(next)
  }, [])

  const addItem = useCallback(
    async (content: string, source: string, language: string) => {
      const now = Date.now()
      const item: Item = {
        id: uid(),
        content,
        source,
        language,
        createdAt: now,
        updatedAt: now,
        annotations: [],
      }
      await persist([...items, item])
      return item
    },
    [items, persist],
  )

  const updateItem = useCallback(
    async (id: string, content: string, source: string, language: string) => {
      const next = items.map((it) => {
        if (it.id !== id) return it
        // 批注是按字符位置(start/end)定位的，原文一旦改动，旧的位置就可能不再
        // 对应原来选中的那段文字，所以这里只在原文没变时保留批注，原文变了就清空，
        // 避免出现批注错位、指向错误文字的问题。
        const contentChanged = it.content !== content
        return {
          ...it,
          content,
          source,
          language,
          annotations: contentChanged ? [] : it.annotations,
          updatedAt: Date.now(),
        }
      })
      await persist(next)
    },
    [items, persist],
  )

  const deleteItem = useCallback(
    async (id: string) => {
      await persist(items.filter((it) => it.id !== id))
    },
    [items, persist],
  )

  const addAnnotation = useCallback(
    async (itemId: string, start: number, end: number, note: string) => {
      const annotation: Annotation = { id: uid(), start, end, note }
      const next = items.map((it) =>
        it.id === itemId
          ? { ...it, annotations: [...it.annotations, annotation], updatedAt: Date.now() }
          : it,
      )
      await persist(next)
    },
    [items, persist],
  )

  const deleteAnnotation = useCallback(
    async (itemId: string, annotationId: string) => {
      const next = items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              annotations: it.annotations.filter((a) => a.id !== annotationId),
              updatedAt: Date.now(),
            }
          : it,
      )
      await persist(next)
    },
    [items, persist],
  )

  const addLanguage = useCallback(
    async (name: string) => {
      const lang: Language = { id: uid(), name }
      const next = [...languages, lang]
      setLanguages(next)
      await db.saveLanguages(next)
      return lang
    },
    [languages],
  )

  return {
    items,
    languages,
    loading,
    addItem,
    updateItem,
    deleteItem,
    addAnnotation,
    deleteAnnotation,
    addLanguage,
  }
}
