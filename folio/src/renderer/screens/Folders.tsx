import React, { useMemo, useState } from 'react'
import { Folder, FolderPlus, ChevronRight, Image as ImageIcon, Edit3, Trash2 } from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'
import ImageGrid from '../components/Image/ImageGrid'
import clsx from 'clsx'

const Folders: React.FC = () => {
  const { folders, currentFolder, setCurrentFolder, addFolder } = useAppStore()

  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    await addFolder(newFolderName.trim())
    setNewFolderName('')
    setShowNewFolderInput(false)
  }

  /**
   * Breadcrumb Generator
   */
  const breadcrumb = useMemo(() => {
    if (!currentFolder) return []

    const path: any[] = []
    let folder = folders.find((f) => f.id === currentFolder)

    while (folder) {
      path.unshift(folder)
      folder = folders.find((f) => f.id === folder?.parent_id)
    }

    return path
  }, [currentFolder, folders])

  /**
   * Folder Tree Renderer
   */
  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    const children = folders.filter((f) => f.parent_id === parentId && !f.deleted_at)

    return children.map((folder) => {
      const isActive = currentFolder === folder.id

      return (
        <div key={folder.id}>
          <button
            onClick={() => setCurrentFolder(folder.id)}
            className={clsx(
              'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
              'hover:bg-neutral-100 dark:hover:bg-dark-muted',
              isActive && 'bg-[#FF5B04]/10 text-[#FF5B04]'
            )}
            style={{ paddingLeft: `${level * 18 + 12}px` }}
          >
            <Folder className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{folder.name}</span>
          </button>

          {renderFolderTree(folder.id, level + 1)}
        </div>
      )
    })
  }

  return (
    <div className="flex h-full gap-10 px-6 py-6">
      {/* Sidebar */}
      <aside className="w-64 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold">Folders</h2>

          <Button variant="ghost" size="sm" onClick={() => setShowNewFolderInput(true)}>
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>

        {showNewFolderInput && (
          <div className="mb-4 space-y-2">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="input w-full text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />

            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleCreateFolder} className="flex-1">
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

        <nav className="space-y-1">
          <button
            onClick={() => setCurrentFolder(null)}
            className={clsx(
              'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
              'hover:bg-neutral-100 dark:hover:bg-dark-muted',
              currentFolder === null && 'bg-[#FF5B04]/10 text-[#FF5B04]'
            )}
          >
            <ImageIcon className="h-4 w-4" />
            All Images
          </button>

          {renderFolderTree()}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span
                className="cursor-pointer hover:underline"
                onClick={() => setCurrentFolder(null)}
              >
                Root
              </span>

              {breadcrumb.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <ChevronRight className="h-4 w-4" />
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => setCurrentFolder(folder.id)}
                  >
                    {folder.name}
                  </span>
                </React.Fragment>
              ))}
            </div>

            <h1 className="mt-2 font-heading text-2xl font-semibold">
              {breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].name : 'All Images'}
            </h1>
          </div>

          {currentFolder && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Edit3 className="h-4 w-4" />
              </Button>

              <Button variant="danger" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Grid — no heavy box */}
        <ImageGrid />
      </main>
    </div>
  )
}

export default Folders
