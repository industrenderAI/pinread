import { useMemo, useState } from 'react'
import type { Item, Category, User } from '../types/item'
import { ItemCard } from './ItemCard'
import { Avatar } from './Avatar'
import { CategoryFilterField, CategoryFilterSheet } from './CategoryFilterSheet'
import { Logo } from './Logo'


export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28.58 27.02" className={className} fill="currentColor">
      <path d="M28.58,25.45l-7.14-7.14c1.28-1.88,2.03-4.14,2.03-6.58C23.46,5.26,18.2,0,11.73,0S0,5.26,0,11.73s5.26,11.73,11.73,11.73c3.23,0,6.16-1.31,8.28-3.43l6.99,6.99,1.57-1.57ZM11.73,21.24c-5.24,0-9.51-4.27-9.51-9.51S6.49,2.22,11.73,2.22s9.51,4.27,9.51,9.51-4.27,9.51-9.51,9.51Z"/>
    </svg>
  )
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 23.01 25.63" className={className} fill="currentColor">
      <path d="M22.75,23.09l-9.92-10.34L21.54,1.52c.33-.43.23-1.03-.24-1.34-.47-.31-1.11-.21-1.45.22l-8.43,10.88L1.81,1.27c-.38-.4-1.04-.43-1.47-.08-.43.35-.47.96-.09,1.36l9.92,10.34L1.47,24.11c-.33.43-.23,1.03.24,1.34.18.12.4.18.6.18.32,0,.64-.14.84-.4l8.43-10.88,9.61,10.01c.2.21.49.32.78.32.25,0,.49-.08.69-.24.43-.35.47-.96.09-1.36Z"/>
    </svg>
  )
}

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

  const categoryColorByName = new Map(categories.map((c) => [c.name, c.color]))

  const filterLabel =
    categoryFilter === 'all'
      ? '全部分类'
      : categoryFilter === ''
        ? '未分类'
        : (usedCategories.find((c) => c.name === categoryFilter)?.name ?? '全部')

  const filterColor =
    categoryFilter === 'all' || categoryFilter === ''
      ? undefined
      : categoryColorByName.get(categoryFilter)

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
    <div className="mx-auto h-screen max-w-lg touch-pan-y overscroll-none overflow-y-auto">

      <div className="sticky top-0 z-10 bg-paper/50 backdrop-blur-md shadow-lg/3 px-3 py-3">

        <div className="flex items-center justify-between">

          <div className="flex items-center py-2">
              <Logo className="h-8 w-auto" />
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

           {searchOpen ? (
              <CloseIcon className="h-4 w-4" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}

            </button>

            <button
              onClick={onProfileClick}
              aria-label="Account"
              className="overflow-hidden rounded-ful"
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
              color={filterColor}
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
              categoryColor={categoryColorByName.get(it.category)}
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