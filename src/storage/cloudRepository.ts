import { supabase } from '../lib/supabaseClient'
import type { Annotation, Item } from '../types/item'
import type { Repository } from './repository'

interface ItemRow {
  id: string
  content: string
  source: string
  language: string
  annotations: Annotation[] | null
  created_at: number
  updated_at: number
}

interface LanguageRow {
  id: string
  name: string
}

function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    content: row.content,
    source: row.source,
    language: row.language,
    annotations: row.annotations ?? [],
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  }
}

const DEFAULT_LANGUAGE_NAMES = ['English', '日本語', '中文']

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

    async getLanguages() {
      const { data, error } = await supabase
        .from('languages')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) throw error

      if (data && data.length > 0) {
        return (data as LanguageRow[]).map((row) => ({ id: row.id, name: row.name }))
      }

      // 这个用户在云端还没有语言分类（比如刚注册），写入默认值
      const { data: inserted, error: insertError } = await supabase
        .from('languages')
        .insert(DEFAULT_LANGUAGE_NAMES.map((name) => ({ user_id: userId, name })))
        .select('id, name')
      if (insertError) throw insertError
      return ((inserted ?? []) as LanguageRow[]).map((row) => ({ id: row.id, name: row.name }))
    },

    async addItem(item) {
      const { error } = await supabase.from('items').insert({
        id: item.id,
        user_id: userId,
        content: item.content,
        source: item.source,
        language: item.language,
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
          language: patch.language,
          annotations: patch.annotations,
          updated_at: patch.updatedAt,
        })
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
    },

    async deleteItem(id) {
      const { error } = await supabase.from('items').delete().eq('id', id).eq('user_id', userId)
      if (error) throw error
    },

    async addAnnotation(itemId, annotation, updatedAt) {
      // annotations 是 jsonb 数组，Postgres 没法直接“追加一个元素”，
      // 所以这里先读出当前值，拼接后整体覆盖写回去。
      const { data, error } = await supabase
        .from('items')
        .select('annotations')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single()
      if (error) throw error
      const next = [...(((data?.annotations as Annotation[] | null) ?? [])), annotation]
      const { error: updateError } = await supabase
        .from('items')
        .update({ annotations: next, updated_at: updatedAt })
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
      const next = (((data?.annotations as Annotation[] | null) ?? [])).filter(
        (a) => a.id !== annotationId,
      )
      const { error: updateError } = await supabase
        .from('items')
        .update({ annotations: next, updated_at: updatedAt })
        .eq('id', itemId)
        .eq('user_id', userId)
      if (updateError) throw updateError
    },

    async addLanguage(language) {
      const { error } = await supabase
        .from('languages')
        .insert({ id: language.id, user_id: userId, name: language.name })
      if (error) throw error
    },
  }
}
