import { useMemo, useState } from 'react'
import type { Item, Category, User } from '../types/item'
import { ItemCard } from './ItemCard'
import { Avatar } from './Avatar'

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
    <div className="mx-auto min-h-screen max-w-lg bg-paper">

      <div className="sticky top-0 z-10 bg-paper/70 backdrop-blur-md border-b border-line/50 px-3 py-3">

        <div className="flex items-center justify-between">

          <div className="flex items-center py-2">
            <img
              src="/icons/logo.svg"
              alt="PinRead"
              className="h-8 w-auto"
            />
          </div>


          <button
            onClick={onProfileClick}
            aria-label="Account"
            className="overflow-hidden rounded-full"
          >
            <Avatar user={user} size="sm" />
          </button>

        </div>



        <div className="my-2 flex items-center gap-2">

          {searchOpen && (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索笔记内容或来源"
              className="
                h-9
                flex-1
                border-b
                focus:border-accent
                focus:outline-hidden
                px-3
                text-xs
                text-ink
                outline-none
                placeholder:text-ink-faint
              "
            />
          )}



          {!searchOpen && (

            <div className="flex-1 flex gap-2 overflow-x-auto">

              <button
                onClick={() => setCategoryFilter('all')}
                className={`shrink-0 rounded-full px-4 py-1 text-xs ${
                  categoryFilter === 'all'
                    ? 'bg-accent text-on-accent'
                    : 'border border-line bg-paper-card text-ink-soft'
                }`}
              >
                全部
              </button>



              {categories
                .filter((c) =>
                  items.some(
                    (it) => it.category === c.name
                  )
                )
                .map((c) => (

                  <button
                    key={c.id}
                    onClick={() =>
                      setCategoryFilter(c.name)
                    }
                    className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                      categoryFilter === c.name
                        ? 'bg-accent text-on-accent'
                        : 'border border-line bg-paper-card text-ink-soft'
                    }`}
                  >
                    {c.name}
                  </button>

                ))}

              {items.some((it) => it.category === '') && (
                <button
                  onClick={() => setCategoryFilter('')}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                    categoryFilter === ''
                      ? 'bg-accent text-on-accent'
                      : 'border border-line bg-paper-card text-ink-soft'
                  }`}
                >
                  未分类
                </button>
              )}

            </div>

          )}



          <button
            onClick={() => {
              if (searchOpen) {
                setSearchOpen(false)
                setQuery('')
              } else {
                setSearchOpen(true)
              }
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center"
          >

            <img
              src={
                searchOpen
                  ? '/icons/close.svg'
                  : '/icons/search.svg'
              }
              alt=""
              className="h-5 w-5"
            />

          </button>


        </div>

      </div>



      <div className="space-y-2.5 px-3 pb-24 pt-3">

        {filtered.length === 0 ? (

          <div className="px-8 py-20 text-center text-sm leading-loose text-ink-faint">
            暂无笔记
            <br />
            点击添加按钮，粘贴内容开始
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
        className="fixed bottom-7 left-1/2 flex h-13.5 w-13.5 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-2xl text-on-accent shadow-lg"
      >
        +
      </button>

    </div>
  )
}