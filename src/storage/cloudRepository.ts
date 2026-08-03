import { supabase } from '../lib/supabaseClient'
import type { Annotation, Item } from '../types/item'
import type { Repository } from './repository'

interface ItemRow {
  id: string
  content: string
  source: string
  category: string
  annotations: Annotation[] | null
  created_at: number
  updated_at: number
}

interface CategoryRow {
  id: string
  name: string
}

function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    content: row.content,
    source: row.source,
    category: row.category,
    annotations: row.annotations ?? [],
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  }
}

/**
 * 每个登录用户对应一个 cloudRepository 实例，所有查询都自动带上
 * `user_id = userId` 的过滤（数据库那边同时用 RLS 再兜底一层，
 * 就算前端代码写错了条件，其他用户的数据也读不到/改不到）。
 */
export function createCloudRepository(userId: string): Repository {
  return {
    async getItems() {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return ((data ?? []) as ItemRow[]).map(rowToItem)
    },

    async getCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return ((data ?? []) as CategoryRow[]).map((row) => ({
        id: row.id,
        name: row.name,
      }))
    },

  async addItem(item) {
    const { error } = await supabase.from('items').insert({
      id: item.id,
      user_id: userId,
      content: item.content,
      source: item.source,
      category: item.category,
      annotations: item.annotations,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    })

      if (error) throw error
    },

    async updateItem(id, patch) {
      const { error } = await supabase
        .from('items')
        .update({
          content: patch.content,
          source: patch.source,
          category: patch.category,
          annotations: patch.annotations,
          updated_at: patch.updatedAt,
        })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    },

    async deleteItem(id) {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    },

    async addAnnotation(itemId, annotation, updatedAt) {
      const { data, error } = await supabase
        .from('items')
        .select('annotations')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const next = [
        ...(((data?.annotations as Annotation[] | null) ?? [])),
        annotation,
      ]

      const { error: updateError } = await supabase
        .from('items')
        .update({
          annotations: next,
          updated_at: updatedAt,
        })
        .eq('id', itemId)
        .eq('user_id', userId)

      if (updateError) throw updateError
    },

    async deleteAnnotation(itemId, annotationId, updatedAt) {
      const { data, error } = await supabase
        .from('items')
        .select('annotations')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const next = (((data?.annotations as Annotation[] | null) ?? []))
        .filter((a) => a.id !== annotationId)

      const { error: updateError } = await supabase
        .from('items')
        .update({
          annotations: next,
          updated_at: updatedAt,
        })
        .eq('id', itemId)
        .eq('user_id', userId)

      if (updateError) throw updateError
    },

    async addCategory(category) {
      const { error } = await supabase
        .from('categories')
        .insert({
          id: category.id,
          user_id: userId,
          name: category.name,
        })

      if (error) throw error

      return category
    },

    async updateCategory(id, name) {
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    },

    async deleteCategory(id) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    },
  }
}