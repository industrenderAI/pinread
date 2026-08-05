import { useMemo, useState } from 'react'
import type { Item, Category, User } from '../types/item'
import { ItemCard } from './ItemCard'
import { Avatar } from './Avatar'
import { CategoryFilterField, CategoryFilterSheet } from './CategoryFilterSheet'

export function ItemList({
  items,
  categories,
  user,
  onOpen,
  onNew,
  onDelete,
  onProfileClick,
}: {
  items: Item[]
  categories: Category[]
  user: User | null
  onOpen: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onProfileClick: () => void
}) {
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  const usedCategories = categories.filter((c) =>
    items.some((it) => it.category === c.name),
  )
  const hasUnfiled = items.some((it) => it.category === '')

  const filterLabel =
    categoryFilter === 'all'
      ? '全部笔记'
      : categoryFilter === ''
        ? '未分类'
        : (usedCategories.find((c) => c.name === categoryFilter)?.name ?? '全部')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return items
      .filter(
        (it) =>
          categoryFilter === 'all' ||
          it.category === categoryFilter
      )
      .filter(
        (it) =>
          !q ||
          it.content.toLowerCase().includes(q) ||
          it.source.toLowerCase().includes(q),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)

  }, [items, query, categoryFilter])


  return (
    <div className="mx-auto h-screen max-w-lg touch-pan-y overscroll-none overflow-y-auto   bg-gray-200">

      <div className="sticky top-0 z-10 bg-paper/70 backdrop-blur-md border-b border-line/50 px-3 py-3">

        <div className="flex items-center justify-between">

          <div className="flex items-center py-2">
            <img
              src="/icons/logo.svg"
              alt="PinRead"
              className="h-8 w-auto"
            />
          </div>


          <div className="flex items-center gap-4">

            <button
              onClick={() => {
                if (searchOpen) {
                  setSearchOpen(false)
                  setQuery('')
                } else {
                  setSearchOpen(true)
                }
              }}
              aria-label="搜索"
              className="flex h-9 w-9 shrink-0 items-center justify-center "
            >

              <img
                src={
                  searchOpen
                    ? '/icons/close.svg'
                    : '/icons/search.svg'
                }
                alt=""
                className="h-4 w-4"
              />

            </button>

            <button
              onClick={onProfileClick}
              aria-label="Account"
              className="overflow-hidden rounded-full"
            >
              <Avatar user={user} size="sm" />
            </button>

          </div>

        </div>



        <div className="my-2 flex items-center px-2 pt-2">

          {searchOpen && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索笔记内容或来源"
              className="
                h-9
                flex-1
                px-4
                focus:outline-hidden
                focus:ring-1
                focus:ring-ink
                focus:ring-offset-1
                focus:ring-offset-paper
                bg-paper
                rounded-full
                text-sm
                text-ink
                outline-none
                placeholder:text-ink-faint
              "
            />
          )}



          {!searchOpen && (

            <CategoryFilterField
              label={filterLabel}
              onOpen={() => setFilterOpen(true)}
            />

          )}

        </div>

      </div>

      {filterOpen && (
        <CategoryFilterSheet
          categories={usedCategories}
          hasUnfiled={hasUnfiled}
          value={categoryFilter}
          onSelect={setCategoryFilter}
          onClose={() => setFilterOpen(false)}
        />
      )}



      <div className="space-y-2.5 px-3 pb-24 pt-3">

        {filtered.length === 0 ? (

          <div className="px-8 py-20 text-center text-base leading-loose text-ink-faint">
            暂无笔记
          </div>

        ) : (

          filtered.map((it) => (

            <ItemCard
              key={it.id}
              item={it}
              onClick={() => onOpen(it.id)}
              onDelete={() => onDelete(it.id)}
            />

          ))

        )}

      </div>



      <button
        onClick={onNew}
        aria-label="新建笔记"
        className="fixed bottom-7 left-1/2 flex h-18 w-18 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-2xl text-on-accent shadow-lg"
      >
        +
      </button>

    </div>
  )
}