import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Annotation, Item, Category } from '../types/item'
import { localRepository } from '../storage/localRepository'
import { createCloudRepository } from '../storage/cloudRepository'
import { migrateLocalToCloud } from '../storage/migrateLocalToCloud'
import { uuid } from '../lib/uuid'
import { pickNextCategoryColor } from '../lib/categoryColors'

/**
 * userId 为 null：未登录，走本地 localStorage。
 * userId 有值：已登录，走 Supabase 云端数据库。
 */
export function useItems(userId: string | null) {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  // 只在内存里记一下"最近一次成功从云端/本地拉到数据是什么时候"，
  // 用于同步设定页面展示，刷新页面就会丢，不用持久化。
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)

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

      const [loadedItems, loadedCategories] = await Promise.all([
        repo.getItems(),
        repo.getCategories(),
      ])

      if (cancelled) return

      setItems(loadedItems)
      setCategories(loadedCategories)
      setLoading(false)
      setLastSyncedAt(Date.now())
    })()

    return () => {
      cancelled = true
    }
  }, [userId, repo])


  /** 手动"重新同步"：不走迁移逻辑，只是重新拉一次当前来源（云端或本地）的最新数据。 */
  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const [loadedItems, loadedCategories] = await Promise.all([
        repo.getItems(),
        repo.getCategories(),
      ])

      setItems(loadedItems)
      setCategories(loadedCategories)
      setLastSyncedAt(Date.now())
    } finally {
      setRefreshing(false)
    }
  }, [repo])

  const addItem = useCallback(
    async (
      content: string,
      source: string,
      categoryName: string,
    ) => {
      const now = Date.now()

      let category = categories.find(
        (c) => c.name === categoryName,
      )

      // 创建笔记时输入了新分类
      if (!category) {
        category = await repo.addCategory({
          id: uuid(),
          name: categoryName,
          color: pickNextCategoryColor(categories.length),
        })

        setCategories((prev) => [
          ...prev,
          category!,
        ])
      }

      const item: Item = {
        id: uuid(),
        content,
        source,
        category: category.name,
        createdAt: now,
        updatedAt: now,
        annotations: [],
      }

      await repo.addItem(item)

      setItems((prev) => [
        item,
        ...prev,
      ])

      return item
    },
    [repo, categories],
  )


  const updateItem = useCallback(
    async (
      id: string,
      content: string,
      source: string,
      category: string,
    ) => {
      const now = Date.now()

      setItems((prev) => {
        const current = prev.find((it) => it.id === id)

        if (!current) return prev

        const contentChanged = current.content !== content

        const annotations = contentChanged
          ? []
          : current.annotations

        repo
          .updateItem(id, {
            content,
            source,
            category,
            annotations,
            updatedAt: now,
          })
          .catch((err) =>
            console.error('updateItem failed', err),
          )

        return prev.map((it) =>
          it.id === id
            ? {
                ...it,
                content,
                source,
                category,
                annotations,
                updatedAt: now,
              }
            : it,
        )
      })
    },
    [repo],
  )


  const deleteItem = useCallback(
    async (id: string) => {
      await repo.deleteItem(id)

      setItems((prev) =>
        prev.filter((it) => it.id !== id),
      )
    },
    [repo],
  )


  const addAnnotation = useCallback(
    async (
      itemId: string,
      start: number,
      end: number,
      note: string,
    ) => {
      const annotation: Annotation = {
        id: uuid(),
        start,
        end,
        note,
      }

      const now = Date.now()

      await repo.addAnnotation(
        itemId,
        annotation,
        now,
      )

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
                ...it,
                annotations: [
                  ...it.annotations,
                  annotation,
                ],
                updatedAt: now,
              }
            : it,
        ),
      )
    },
    [repo],
  )


  const deleteAnnotation = useCallback(
    async (
      itemId: string,
      annotationId: string,
    ) => {
      const now = Date.now()

      await repo.deleteAnnotation(
        itemId,
        annotationId,
        now,
      )

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
                ...it,
                annotations: it.annotations.filter(
                  (a) => a.id !== annotationId,
                ),
                updatedAt: now,
              }
            : it,
        ),
      )
    },
    [repo],
  )


  const addCategory = useCallback(
    async (name: string, color?: string) => {
      const category: Category = {
        id: uuid(),
        name,
        color: color ?? pickNextCategoryColor(categories.length),
      }

      await repo.addCategory(category)

      setCategories((prev) => [
        ...prev,
        category,
      ])

      return category
    },
    [repo, categories],
  )


  const updateCategory = useCallback(
    async (id: string, name: string, color?: string) => {
      const target = categories.find((c) => c.id === id)
      const nextColor = color ?? target?.color

      await repo.updateCategory(id, name, nextColor)

      // 分类改名后，同步把用这个旧名字的笔记也改成新名字，
      // 不然这些笔记会跟改完名的分类"失联"。
      if (target && target.name !== name) {
        await repo.renameItemsCategory(target.name, name)

        setItems((prev) =>
          prev.map((it) =>
            it.category === target.name
              ? { ...it, category: name }
              : it,
          ),
        )
      }

      setCategories((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, name, color: nextColor }
            : item,
        ),
      )
    },
    [repo, categories],
  )


  const deleteCategory = useCallback(
    async (id: string) => {
      const target = categories.find((c) => c.id === id)

      await repo.deleteCategory(id)

      // 分类被删掉后，把用这个分类的笔记安全移到"未分类"（category 设为空字符串），
      // 而不是让笔记留着一个已经不存在的分类名。
      if (target) {
        await repo.renameItemsCategory(target.name, '')

        setItems((prev) =>
          prev.map((it) =>
            it.category === target.name
              ? { ...it, category: '' }
              : it,
          ),
        )
      }

      setCategories((prev) =>
        prev.filter((item) => item.id !== id),
      )
    },
    [repo, categories],
  )


  return {
    items,
    categories,
    loading,
    refreshing,
    lastSyncedAt,
    refresh,

    addItem,
    updateItem,
    deleteItem,

    addAnnotation,
    deleteAnnotation,

    addCategory,
    updateCategory,
    deleteCategory,
  }
}