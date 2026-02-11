import React, { useState } from 'react'
import { 
  Folder, 
  FolderPlus, 
  ChevronRight, 
  Image as ImageIcon,
  MoreHorizontal,
  Edit3,
  Trash2
} from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'
import ImageGrid from '../components/Image/ImageGrid'

const Folders: React.FC = () => {
  const { folders, currentFolder, setCurrentFolder, addFolder, theme } = useAppStore()
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await addFolder(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolderInput(false)
    }
  }

  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    const childFolders = folders.filter(f => f.parent_id === parentId && !f.deleted_at)
    
    return childFolders.map(folder => (
      <div key={folder.id} className="space-y-1">
        <button
          onClick={() => setCurrentFolder(folder.id)}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-dark-muted ${
            currentFolder === folder.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          <Folder className="h-4 w-4" />
          <span className="flex-1 font-ui text-sm">{folder.name}</span>
          <span className="text-xs text-neutral-500">
            {folders.filter(f => f.parent_id === folder.id).length}
          </span>
        </button>
        {renderFolderTree(folder.id, level + 1)}
      </div>
    ))
  }

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar - Folder Tree */}
      <div className="w-64 space-y-4">
        <div className="rounded-3xl border border-base-border bg-base-surface p-4 dark:border-dark-muted dark:bg-dark-base">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg">Folders</h2>
            <Button
              variant="ghost"
              size="sm"
              icon={FolderPlus}
              onClick={() => setShowNewFolderInput(true)}
            />
          </div>

          {showNewFolderInput && (
            <div className="mb-4 space-y-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="input w-full text-sm"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateFolder}
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowNewFolderInput(false)
                    setNewFolderName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => setCurrentFolder(null)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-neutral-100 dark:hover:bg-dark-muted ${
                currentFolder === null ? 'bg-primary-50 dark:bg-primary-900/30' : ''
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="font-ui text-sm">All Images</span>
            </button>
            {renderFolderTree()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-ui text-sm text-neutral-500">Root</span>
              <ChevronRight className="h-4 w-4 text-neutral-400" />
              <span className="font-heading text-xl">Current Folder</span>
            </div>
            <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
              {currentFolder ? 'Folder contents' : 'All images'}
            </p>
          </div>

          {currentFolder && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={Edit3}>
                Edit
              </Button>
              <Button variant="danger" size="sm" icon={Trash2}>
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-base-border bg-base-surface p-6 dark:border-dark-muted dark:bg-dark-base">
          <ImageGrid />
        </div>
      </div>
    </div>
  )
}

export default Folders