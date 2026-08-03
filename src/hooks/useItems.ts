import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Annotation, Item, Category } from '../types/item'
import { localRepository } from '../storage/localRepository'
import { createCloudRepository } from '../storage/cloudRepository'
import { migrateLocalToCloud } from '../storage/migrateLocalToCloud'

/**
 * userId 为 null：未登录，走本地 localStorage。
 * userId 有值：已登录，走 Supabase 云端数据库。
 */
export function useItems(userId: string | null) {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
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

      const [loadedItems, loadedCategories] = await Promise.all([
        repo.getItems(),
        repo.getCategories(),
      ])

      if (cancelled) return

      setItems(loadedItems)
      setCategories(loadedCategories)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [userId, repo])

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
        id: crypto.randomUUID(),
        name: categoryName,
      })

      setCategories((prev) => [
        ...prev,
        category!,
      ])
    }

    const item: Item = {
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
    async (name: string) => {
      const category: Category = {
        id: crypto.randomUUID(),
        name,
      }

      await repo.addCategory(category)

      setCategories((prev) => [
        ...prev,
        category,
      ])

      return category
    },
    [repo],
  )


  const updateCategory = useCallback(
    async (id: string, name: string) => {
      await repo.updateCategory(id, name)

      setCategories((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, name }
            : item,
        ),
      )
    },
    [repo],
  )


  const deleteCategory = useCallback(
    async (id: string) => {
      await repo.deleteCategory(id)

      setCategories((prev) =>
        prev.filter((item) => item.id !== id),
      )
    },
    [repo],
  )


  return {
    items,
    categories,
    loading,

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