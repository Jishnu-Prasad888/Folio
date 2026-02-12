import React, { useState, useEffect } from 'react'
import { Trash2, RotateCcw, Eye, Clock, Folder } from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'
import { format } from 'date-fns'

const Trash: React.FC = () => {
  const { trash, loadTrash, restoreItem, permanentlyDelete } = useAppStore()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    loadTrash()
  }, [])

  const handleRestore = async (type: 'image' | 'folder', id: string) => {
    await restoreItem(type, id)
  }

  const handlePermanentDelete = async (type: 'image' | 'folder', id: string) => {
    await permanentlyDelete(type, id)
    setConfirmDelete(null)
  }

  if (trash.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-2xl bg-neutral-100 p-8 dark:bg-dark-muted">
          <Trash2 className="h-12 w-12 text-neutral-400" />
        </div>
        <h3 className="font-heading text-2xl font-semibold">Trash is empty</h3>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
          Deleted images and folders will appear here and stay for 30 days before being permanently
          removed.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold">Trash</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Items are automatically deleted after 30 days
        </p>
      </div>

      {/* Container */}
      <div className="rounded-3xl border border-base-border bg-base-surface p-6 shadow-sm dark:border-dark-muted dark:bg-dark-base">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm">
            <span className="font-medium">{trash.length}</span> item{trash.length !== 1 ? 's' : ''}{' '}
            in trash
          </p>

          <Button
            variant="danger"
            onClick={async () => {
              if (window.confirm('Empty trash? This cannot be undone.')) {
                await window.api.emptyTrash()
                loadTrash()
              }
            }}
          >
            Empty Trash
          </Button>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {trash.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between rounded-2xl border border-base-border p-5 transition-colors hover:bg-neutral-50 dark:border-dark-muted dark:hover:bg-dark-muted"
            >
              {/* Left */}
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-dark-base">
                  {item.type === 'image' ? (
                    <Eye className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <Folder className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium">{item.name}</h4>

                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="h-3.5 w-3.5" />
                    Deleted {format(new Date(item.deleted_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => handleRestore(item.type, item.id)}
                  className="bg-success-soft text-success-text hover:opacity-90"
                >
                  Restore
                </Button>

                {confirmDelete === item.id ? (
                  <div className="flex items-center gap-3 rounded-xl bg-error-soft px-4 py-2">
                    <span className="text-xs font-medium text-error-text">Permanently delete?</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handlePermanentDelete(item.type, item.id)}
                    >
                      Yes
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                      No
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Trash
