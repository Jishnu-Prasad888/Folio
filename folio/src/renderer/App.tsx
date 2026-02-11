import React, { useEffect } from 'react'
import { useAppStore } from './store'
import Sidebar from './components/Layout/Sidebar'
import Topbar from './components/Layout/Topbar' // Add this import
import AllPhotos from './screens/AllPhotos'
import Folders from './screens/Folders'
import Settings from './screens/Settings'
import Trash from './screens/Trash'
import Onboarding from './screens/Onboarding'
import Notification from './components/Common/Notification'

const App: React.FC = () => {
  const { theme, currentFolder, loadFolders, loadTags, error, setError } = useAppStore()

  useEffect(() => {
    // Set theme class on body
    document.documentElement.classList.toggle('dark', theme === 'dark')

    // Load initial data
    loadFolders()
    loadTags()
  }, [theme])

  const renderScreen = () => {
    switch (currentFolder) {
      case 'folders':
        return <Folders />
      case 'trash':
        return <Trash />
      case 'settings':
        return <Settings />
      case null:
      default:
        return <AllPhotos />
    }
  }

  return (
    <div className={`flex h-screen flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Topbar */}
      <div className="px-6 pt-6">
        <Topbar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden px-6 pb-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 pr-6">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderScreen()}
        </div>
      </div>

      {/* Onboarding Modal (first launch) */}
      <Onboarding />

      {/* Error Notification */}
      {error && (
        <Notification
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  )
}

export default App