import { useState } from 'react'
import { useItems } from './hooks/useItems'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { ItemList } from './components/ItemList'
import { NewItemSheet } from './components/NewItemSheet'
import { ItemDetail } from './components/ItemDetail'
import { ProfilePage } from './components/ProfilePage'
import { LoginPage } from './components/LoginPage'
import { CategoryManagePage } from './components/CategoryManagePage'
import { AccountPage } from './components/AccountPage'




type View =
  | 'list'
  | 'new'
  | 'edit'
  | 'detail'
  | 'profile'
  | 'login'
  | 'categories'
  | 'account'

function App() {
  const {
    user,
    loading: authLoading,
    signUpWithPassword,
    signInWithPassword,
    sendOtp,
    verifyOtp,
    signInWithGoogle,
    logout,
    updateName,
    updateEmail,
    updatePassword,
    deleteAccount,
  } = useAuth()

  const {
    items,
    categories,
    loading: itemsLoading,

    addItem,
    updateItem,
    deleteItem,

    addAnnotation,
    deleteAnnotation,

    addCategory,
    updateCategory,
    deleteCategory,

  } = useItems(user?.id ?? null)

  const { theme, toggleTheme } = useTheme()

const [view, setView] = useState<View>('list')
const [selectedId, setSelectedId] = useState<string | null>(null)

if (authLoading || itemsLoading) return null

const usedCategories = categories.filter(category =>
  items.some(item => item.category === category.name)
)

const selected = items.find((it) => it.id === selectedId) ?? null

  return (
    <>
      <ItemList
        items={items}
        categories={usedCategories}
        user={user}
        onOpen={(id) => {
          setSelectedId(id)
          setView('detail')
        }}
        // onNew={() => setView('new')}
        onNew={() => {
          if (!user) {
            setView('login')
            return
          }
          setView('new')
        }}
        onDelete={(id) => deleteItem(id)}
        onProfileClick={() => setView('profile')}
      />


      {view === 'profile' && (
        <ProfilePage
          user={user}
          onBack={() => setView('list')}
          onLogout={() => logout()}
          onLoginClick={() => setView('login')}
                    onCategoryClick={() => setView('categories')}
                    onAccountClick={() => setView('account')}
                  />
                )}
                {view === 'account' && (
                  <AccountPage
                    user={user}
                    onBack={() => setView('profile')}
                    onUpdateName={updateName}
                    onUpdateEmail={updateEmail}
                    onUpdatePassword={updatePassword}
                    onDeleteAccount={deleteAccount}
                  />
                )}

      {view === 'login' && (
        <LoginPage
          onBack={() => setView('profile')}
          onSuccess={() => setView('profile')}
          onSignUpWithPassword={signUpWithPassword}
          onSignInWithPassword={signInWithPassword}
          onSendOtp={sendOtp}
          onVerifyOtp={verifyOtp}
          onSignInWithGoogle={signInWithGoogle}
        />
      )}


      {view === 'new' && (
        <NewItemSheet
          categories={categories}
          onCancel={() => setView('list')}
          onAddCategory={addCategory}
          onSave={async (content, source, category) => {
            const item = await addItem(content, source, category)
            setSelectedId(item.id)
            setView('detail')
          }}
        />
      )}


      {view === 'edit' && selected && (
        <NewItemSheet
          categories={categories}
          initial={{
            content: selected.content,
            source: selected.source,
            category: selected.category,
          }}
          onCancel={() => setView('detail')}
          onAddCategory={addCategory}
          onSave={async (content, source, category) => {
            await updateItem(
              selected.id,
              content,
              source,
              category
            )
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
          onAddAnnotation={(start, end, note) =>
            addAnnotation(selected.id, start, end, note)
          }
          onDeleteAnnotation={(annotationId) =>
            deleteAnnotation(selected.id, annotationId)
          }
        />
      )}

    {view === 'categories' && (
            <CategoryManagePage
              categories={categories}
              items={items}
              onBack={() => setView('profile')}
              onAdd={addCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
            />
          )}


    </>
    
  )
}

export default App