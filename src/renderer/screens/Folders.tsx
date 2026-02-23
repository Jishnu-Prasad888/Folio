import React, { useState, useMemo } from 'react'
import { Folder, FolderPlus, Image as ImageIcon, ChevronRight } from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'
import ImageGrid from '../components/Image/ImageGrid'
import ImageUpload from '../components/Image/ImageUpload'
import clsx from 'clsx'
import ContextMenu from '../components/Common/ContextMenu'

interface ContextMenuState {
  x: number
  y: number
  folderId: string | null
  visible: boolean
}

const Folders: React.FC = () => {
  const { folders, currentFolder, setCurrentFolder, addFolder } = useAppStore()

  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadTargetFolder, setUploadTargetFolder] = useState<string | undefined>()
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    x: 0,
    y: 0,
    folderId: null,
    visible: false
  })

  /** Create folder */
  const handleCreateFolder = async (parentId: string | null = null) => {
    if (!newFolderName.trim()) return
    await addFolder(newFolderName.trim(), parentId || undefined)
    setNewFolderName('')
    setShowNewFolderInput(false)
  }

  /** Breadcrumb Generator */
  const breadcrumb = useMemo(() => {
    if (!currentFolder) return []
    const path: typeof folders = []
    let folder = folders.find((f) => f.id === currentFolder)
    while (folder) {
      path.unshift(folder)
      folder = folders.find((f) => f.id === folder?.parent_id)
    }
    return path
  }, [currentFolder, folders])

  /** Right-click handler */
  const handleRightClick = (e: React.MouseEvent, folderId: string | null = null) => {
    e.preventDefault()
    const menuWidth = 160
    const menuHeight = 80
    const x = Math.min(e.clientX, window.innerWidth - menuWidth)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight)
    setContextMenu({ x, y, folderId, visible: true })
  }

  /** Context menu actions */
  const handleAddImage = () => {
    setUploadTargetFolder(contextMenu.folderId || undefined)
    setIsUploadModalOpen(true)
    setContextMenu({ ...contextMenu, visible: false })
  }

  const handleAddFolder = () => {
    setCurrentFolder(contextMenu.folderId || null)
    setShowNewFolderInput(true)
    setContextMenu({ ...contextMenu, visible: false })
  }

  /** Close context menu on outside click */
  const handleClickOutside = (e: React.MouseEvent) => {
    // Only close on left click
    if (contextMenu.visible && e.button === 0) {
      setContextMenu({ ...contextMenu, visible: false })
    }
  }

  /** Folder Tree Renderer */
  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    const children = folders.filter((f) => f.parent_id === parentId && !f.deleted_at)
    return children.map((folder) => {
      const isActive = currentFolder === folder.id
      return (
        <div key={folder.id}>
          <button
            onClick={() => setCurrentFolder(folder.id)}
            onContextMenu={(e) => handleRightClick(e, folder.id)}
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
    <div
      className="flex h-full gap-10 px-6 py-6"
      onClick={handleClickOutside}
      onContextMenu={(e) => e.preventDefault()} // prevent default globally
    >
      {/* Sidebar */}
      <aside className="w-64 shrink-0 relative">
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
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder(currentFolder)}
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCreateFolder(currentFolder)}
                className="flex-1"
              >
                Create
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowNewFolderInput(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <nav className="space-y-1">
          <button
            onClick={() => setCurrentFolder(null)}
            onContextMenu={(e) => handleRightClick(e, null)}
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

        {/* Context Menu */}
        {contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            visible={contextMenu.visible}
            items={[
              { label: 'Add Image', onClick: handleAddImage },
              { label: 'New Folder', onClick: handleAddFolder }
            ]}
          />
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
          <span onClick={() => setCurrentFolder(null)} className="cursor-pointer hover:underline">
            Root
          </span>
          {breadcrumb.map((f) => (
            <React.Fragment key={f.id}>
              <ChevronRight className="h-4 w-4" />
              <span
                onClick={() => setCurrentFolder(f.id)}
                className="cursor-pointer hover:underline"
              >
                {f.name}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Header & Upload Button */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold">
            {currentFolder ? folders.find((f) => f.id === currentFolder)?.name : 'All Images'}
          </h1>
          <Button
            variant="primary"
            onClick={() => {
              setUploadTargetFolder(currentFolder || undefined)
              setIsUploadModalOpen(true)
            }}
          >
            Upload Images
          </Button>
        </div>

        {/* Image Grid */}
        <ImageGrid onContextMenu={(e) => handleRightClick(e, currentFolder)} />

        {/* Upload Modal */}
        <ImageUpload
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          targetFolder={uploadTargetFolder}
        />
      </main>
    </div>
  )
}

export default Folders
