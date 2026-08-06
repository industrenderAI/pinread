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
import { SyncSettingsPage } from './components/SyncSettingsPage'
import { AboutPage } from './components/AboutPage'
import { HelpPage } from './components/HelpPage'

type View =
  | 'list'
  | 'new'
  | 'edit'
  | 'detail'
  | 'profile'
  | 'login'
  | 'categories'
  | 'account'
  | 'sync'
  | 'about'
  | 'help'

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

  } = useItems(user?.id ?? null)

  const { theme, toggleTheme } = useTheme()

const [view, setView] = useState<View>('list')
const [selectedId, setSelectedId] = useState<string | null>(null)
// 记录这次跳去登录页是从哪触发的，登录页返回/登录成功后要回到同一个地方，
// 而不是不管三七二十一都回个人中心。
const [loginReturnTo, setLoginReturnTo] = useState<View>('profile')

if (authLoading || itemsLoading) return null

const usedCategories = categories.filter(category =>
  items.some(item => item.category === category.name)
)

const selected = items.find((it) => it.id === selectedId) ?? null

  return (
    <>
      {view === 'list' && (
        <ItemList
          items={items}
          categories={usedCategories}
          user={user}
          onOpen={(id) => {
            setSelectedId(id)
            setView('detail')
          }}

          onNew={() => {
            if (!user) {
              setLoginReturnTo('list')
              setView('login')
              return
            }
            setView('new')
          }}

          onDelete={(id) => deleteItem(id)}
          onProfileClick={() => setView('profile')}
        />
      )}

      {view === 'profile' && (
        <ProfilePage
          user={user}
          onBack={() => setView('list')}
          onLogout={() => logout()}
          onLoginClick={() => {
            setLoginReturnTo('profile')
            setView('login')
          }}
          onCategoryClick={() => setView('categories')}
          onAccountClick={() => setView('account')}
          onSyncClick={() => setView('sync')}
          onAboutClick={() => setView('about')}
          onHelpClick={() => setView('help')}
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
      {view === 'sync' && (
        <SyncSettingsPage
          user={user}
          lastSyncedAt={lastSyncedAt}
          refreshing={refreshing}
          onBack={() => setView('profile')}
          onRefresh={refresh}
          onLoginClick={() => {
            setLoginReturnTo('sync')
            setView('login')
          }}
        />
      )}
      
      {view === 'about' && (
        <AboutPage
          onBack={() => setView('profile')}
        />
      )}

      {view === 'help' && (
        <HelpPage
          onBack={() => setView('profile')}
        />
      )}

      {view === 'login' && (
        <LoginPage
          onBack={() => setView(loginReturnTo)}
          onSuccess={() => setView(loginReturnTo)}
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