import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Annotation, Item, Language } from '../types/item'
import { localRepository } from '../storage/localRepository'
import { createCloudRepository } from '../storage/cloudRepository'
import { migrateLocalToCloud } from '../storage/migrateLocalToCloud'

/**
 * userId 为 null：未登录，走本地 localStorage（本地体验版）。
 * userId 有值：已登录，走 Supabase 云端数据库，多设备共享同一份数据。
 * 从 null 变成有值的那一刻（刚登录成功），会先把这台设备上的本地笔记
 * 迁移一次到云端，详见 migrateLocalToCloud。
 */
export function useItems(userId: string | null) {
  const [items, setItems] = useState<Item[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  const repo = useMemo(
    () => (userId ? createCloudRepository(userId) : localRepository),
    [userId],
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      if (userId) {
        await migrateLocalToCloud(userId)
      }
      const [loadedItems, loadedLanguages] = await Promise.all([
        repo.getItems(),
        repo.getLanguages(),
      ])
      if (cancelled) return
      setItems(loadedItems)
      setLanguages(loadedLanguages)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [userId, repo])

  const addItem = useCallback(
    async (content: string, source: string, language: string) => {
      const now = Date.now()
      const item: Item = {
        id: crypto.randomUUID(),
        content,
        source,
        language,
        createdAt: now,
        updatedAt: now,
        annotations: [],
      }
      await repo.addItem(item)
      setItems((prev) => [item, ...prev])
      return item
    },
    [repo],
  )

  const updateItem = useCallback(
    async (id: string, content: string, source: string, language: string) => {
      const now = Date.now()
      setItems((prev) => {
        const current = prev.find((it) => it.id === id)
        if (!current) return prev
        // 批注是按字符位置(start/end)定位的，原文一旦改动，旧的位置就可能不再
        // 对应原来选中的那段文字，所以这里只在原文没变时保留批注，原文变了就清空，
        // 避免出现批注错位、指向错误文字的问题。
        const contentChanged = current.content !== content
        const annotations = contentChanged ? [] : current.annotations
        repo
          .updateItem(id, { content, source, language, annotations, updatedAt: now })
          .catch((err) => console.error('updateItem failed', err))
        return prev.map((it) =>
          it.id === id ? { ...it, content, source, language, annotations, updatedAt: now } : it,
        )
      })
    },
    [repo],
  )

  const deleteItem = useCallback(
    async (id: string) => {
      await repo.deleteItem(id)
      setItems((prev) => prev.filter((it) => it.id !== id))
    },
    [repo],
  )

  const addAnnotation = useCallback(
    async (itemId: string, start: number, end: number, note: string) => {
      const annotation: Annotation = { id: crypto.randomUUID(), start, end, note }
      const now = Date.now()
      await repo.addAnnotation(itemId, annotation, now)
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, annotations: [...it.annotations, annotation], updatedAt: now }
            : it,
        ),
      )
    },
    [repo],
  )

  const deleteAnnotation = useCallback(
    async (itemId: string, annotationId: string) => {
      const now = Date.now()
      await repo.deleteAnnotation(itemId, annotationId, now)
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, annotations: it.annotations.filter((a) => a.id !== annotationId), updatedAt: now }
            : it,
        ),
      )
    },
    [repo],
  )

  const addLanguage = useCallback(
    async (name: string) => {
      const lang: Language = { id: crypto.randomUUID(), name }
      await repo.addLanguage(lang)
      setLanguages((prev) => [...prev, lang])
      return lang
    },
    [repo],
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
