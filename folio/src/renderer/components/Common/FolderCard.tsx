import React, { useState } from 'react'
import { Folder, FolderOpen, MoreHorizontal, Image as ImageIcon, Trash2, Edit3 } from 'lucide-react'
import { Folder as FolderType } from '../../types'
import { useAppStore } from '../../store'
import Button from './Button'
import clsx from 'clsx'

interface FolderCardProps {
  folder: FolderType
  onClick: (folderId: string) => void
  isSelected?: boolean
  showOptions?: boolean
  level?: number
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onClick,
  isSelected = false,
  showOptions = true,
  level = 0
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { theme } = useAppStore()

  const handleDelete = () => {
    if (window.confirm(`Move folder "${folder.name}" to trash?`)) {
      window.api.deleteFolder(folder.id)
    }
  }

  const handleEdit = () => {
    const newName = prompt('Enter new folder name:', folder.name)
    if (newName && newName.trim() && newName !== folder.name) {
      window.api.updateFolder(folder.id, { name: newName.trim() })
    }
  }

  return (
    <div
      className={clsx(
        "group relative rounded-2xl border transition-all duration-200",
        isSelected
          ? "border-primary-300 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20"
          : "border-base-border bg-base-surfaceAlt hover:border-primary-200 dark:border-dark-muted dark:bg-dark-base dark:hover:border-primary-400",
        level > 0 && "ml-6"
      )}
      style={{ marginLeft: `${level * 1.5}rem` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex cursor-pointer items-center gap-3 p-4"
        onClick={() => onClick(folder.id)}
      >
        <div className={clsx(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          isSelected
            ? "bg-primary-100 text-primary-500 dark:bg-primary-800"
            : "bg-neutral-100 text-neutral-600 dark:bg-dark-muted dark:text-neutral-400"
        )}>
          {isSelected ? (
            <FolderOpen className="h-6 w-6" />
          ) : (
            <Folder className="h-6 w-6" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-ui text-sm font-medium">{folder.name}</h3>
          <p className="font-body text-xs text-neutral-500 dark:text-neutral-400">
            Created {new Date(folder.created_at).toLocaleDateString()}
          </p>
        </div>

        {showOptions && isHovered && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Action Dropdown */}
      {showActions && (
        <div
          className={clsx(
            "absolute right-2 top-12 z-10 w-48 rounded-xl border shadow-lg",
            theme === 'dark'
              ? "border-dark-muted bg-dark-base"
              : "border-base-border bg-base-surface"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleEdit}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted"
          >
            <Edit3 className="h-4 w-4" />
            Rename Folder
          </button>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted">
            <ImageIcon className="h-4 w-4" />
            Add Images
          </button>
          <div className="my-1 border-t border-base-border dark:border-dark-muted" />
          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error-text hover:bg-error-soft"
          >
            <Trash2 className="h-4 w-4" />
            Move to Trash
          </button>
        </div>
      )}
    </div>
  )
}

export default FolderCard