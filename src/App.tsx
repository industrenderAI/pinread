import { useState } from 'react'
import { useItems } from './hooks/useItems'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { ItemList } from './components/ItemList'
import { NewItemSheet } from './components/NewItemSheet'
import { ItemDetail } from './components/ItemDetail'
import { ProfilePage } from './components/ProfilePage'

type View = 'list' | 'new' | 'edit' | 'detail' | 'profile'

function App() {
  const {
    items,
    languages,
    loading,
    addItem,
    updateItem,
    deleteItem,
    addAnnotation,
    deleteAnnotation,
    addLanguage,
  } = useItems()
  const { theme, toggleTheme } = useTheme()
  const { user, login, logout } = useAuth()

  const [view, setView] = useState<View>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (loading) return null

  const selected = items.find((it) => it.id === selectedId) ?? null

  return (
    <>
      <ItemList
        items={items}
        languages={languages}
        user={user}
        onOpen={(id) => {
          setSelectedId(id)
          setView('detail')
        }}
        onNew={() => setView('new')}
        onDelete={(id) => deleteItem(id)}
        onProfileClick={() => setView('profile')}
      />

      {view === 'profile' && (
        <ProfilePage
          user={user}
          onBack={() => setView('list')}
          onLogin={(name) => login(name)}
          onLogout={() => logout()}
        />
      )}

      {view === 'new' && (
        <NewItemSheet
          languages={languages}
          onCancel={() => setView('list')}
          onAddLanguage={addLanguage}
          onSave={async (content, source, language) => {
            const item = await addItem(content, source, language)
            setSelectedId(item.id)
            setView('detail')
          }}
        />
      )}

      {view === 'edit' && selected && (
        <NewItemSheet
          languages={languages}
          initial={{ content: selected.content, source: selected.source, language: selected.language }}
          onCancel={() => setView('detail')}
          onAddLanguage={addLanguage}
          onSave={async (content, source, language) => {
            await updateItem(selected.id, content, source, language)
            setView('detail')
          }}
        />
      )}

      {view === 'detail' && selected && (
        <ItemDetail
          item={selected}
          theme={theme}
          onBack={() => setView('list')}
          onEdit={() => setView('edit')}
          onToggleTheme={toggleTheme}
          onAddAnnotation={(start, end, note) => addAnnotation(selected.id, start, end, note)}
          onDeleteAnnotation={(annotationId) => deleteAnnotation(selected.id, annotationId)}
        />
      )}
    </>
  )
}

export default App
