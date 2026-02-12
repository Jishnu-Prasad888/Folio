import React from 'react'
import { Home, Folder, Settings, Trash2, Image as ImageIcon, FolderPlus } from 'lucide-react'
import { useAppStore } from '../../store'
import clsx from 'clsx'

const Sidebar: React.FC = () => {
  const { setCurrentFolder, theme, addFolder, currentFolder, addImages } = useAppStore()

  const [isFolderModalOpen, setIsFolderModalOpen] = React.useState(false)
  const [folderName, setFolderName] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)

  const navItems = [
    { id: null, icon: Home, label: 'All Photos' },
    { id: 'folders', icon: Folder, label: 'Folders' },
    { id: 'trash', icon: Trash2, label: 'Trash' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ]

  const handleAddImage = async () => {
    const filePaths = await window.api.openFileDialog()
    if (!filePaths?.length) return
    await addImages(filePaths, currentFolder || undefined)
  }

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return

    try {
      setIsCreating(true)
      await addFolder(folderName.trim(), currentFolder || undefined)
      setFolderName('')
      setIsFolderModalOpen(false)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex h-full w-60 flex-col pt-2 pr-2">
      <div className="card flex h-full w-60b flex-col">
        {/* Branding */}
        <div className="mb-8">
          <h1 className="font-play text-2xl font-bold text-[#FF5B04]">Folio</h1>
          <p className="mt-1 text-sm opacity-70">Preserve what matters.</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const ActiveIcon = item.icon
            const isActive = currentFolder === item.id

            return (
              <button
                key={item.label}
                onClick={() => setCurrentFolder(item.id)}
                className={clsx(
                  'btn-ghost flex w-full items-center gap-3 text-sm',
                  isActive && 'bg-[#ECD0DE]'
                )}
              >
                <ActiveIcon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <button
            className="btn-primary flex w-full items-center justify-center gap-2"
            onClick={handleAddImage}
          >
            <ImageIcon className="h-4 w-4" />
            Add Image
          </button>

          <button
            className="btn-secondary flex w-full items-center justify-center gap-2"
            onClick={() => setIsFolderModalOpen(true)}
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className={clsx('card w-96 shadow-2xl', theme === 'dark' && 'glass-dark')}>
            <h2 className="mb-4 text-lg font-semibold">Create New Folder</h2>

            <input
              autoFocus
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              className="input w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder()
                if (e.key === 'Escape') setIsFolderModalOpen(false)
              }}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsFolderModalOpen(false)
                  setFolderName('')
                }}
                className="btn-ghost"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateFolder}
                disabled={!folderName.trim() || isCreating}
                className="btn-primary disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
