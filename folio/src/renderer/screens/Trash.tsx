import React, { useState } from 'react'
import { Trash2, RotateCcw, Eye, Clock } from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'
import { format } from 'date-fns'

const Trash: React.FC = () => {
  const { trash, loadTrash, restoreItem, permanentlyDelete } = useAppStore()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleRestore = async (type: 'image' | 'folder', id: string) => {
    await restoreItem(type, id)
  }

  const handlePermanentDelete = async (type: 'image' | 'folder', id: string) => {
    await permanentlyDelete(type, id)
    setConfirmDelete(null)
  }

  React.useEffect(() => {
    loadTrash()
  }, [])

  if (trash.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-4 rounded-full bg-neutral-100 p-6 dark:bg-dark-muted">
          <Trash2 className="h-12 w-12 text-neutral-400" />
        </div>
        <h3 className="font-heading text-xl">Trash is empty</h3>
        <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
          Deleted items will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="font-heading text-2xl">Trash</h1>
        <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
          Items are automatically deleted after 30 days
        </p>
      </div>

      <div className="rounded-3xl border border-base-border bg-base-surface p-6 dark:border-dark-muted dark:bg-dark-base">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-body text-sm">
            {trash.length} item{trash.length !== 1 ? 's' : ''} in trash
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

        <div className="space-y-2">
          {trash.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between rounded-xl border border-base-border p-4 hover:bg-neutral-50 dark:border-dark-muted dark:hover:bg-dark-muted"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-dark-base">
                  {item.type === 'image' ? (
                    <Eye className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <Trash2 className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-ui text-sm font-medium">{item.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="h-3 w-3" />
                    Deleted {format(new Date(item.deleted_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => handleRestore(item.type, item.id)}
                  className="bg-success-soft text-success-text hover:opacity-80"
                >
                  Restore
                </Button>

                {confirmDelete === item.id ? (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-error-text">Permanently delete?</p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handlePermanentDelete(item.type, item.id)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(null)}
                    >
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