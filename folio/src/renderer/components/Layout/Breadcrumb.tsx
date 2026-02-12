import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useAppStore } from '../../store'
import clsx from 'clsx'

interface BreadcrumbItem {
  id: string | null
  name: string
  type: 'root' | 'folder'
}

const Breadcrumb: React.FC = () => {
  const { folders, currentFolder, setCurrentFolder } = useAppStore()
  const [breadcrumbItems, setBreadcrumbItems] = React.useState<BreadcrumbItem[]>([])

  React.useEffect(() => {
    if (!currentFolder) {
      setBreadcrumbItems([{ id: null, name: 'All Photos', type: 'root' }])
      return
    }

    const items: BreadcrumbItem[] = []
    let current = folders.find((f) => f.id === currentFolder)

    while (current) {
      items.unshift({
        id: current.id,
        name: current.name,
        type: 'folder'
      })

      current = current.parent_id ? folders.find((f) => f.id === current!.parent_id) : undefined
    }

    items.unshift({ id: null, name: 'Folders', type: 'root' })

    setBreadcrumbItems(items)
  }, [currentFolder, folders])

  if (breadcrumbItems.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1

          return (
            <li key={item.id ?? 'root'} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-neutral-300 dark:text-neutral-600" />
              )}

              <button
                onClick={() => setCurrentFolder(item.id)}
                className={clsx(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all',
                  isLast
                    ? 'font-medium text-primary-500'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-dark-muted dark:hover:text-white'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {index === 0 ? (
                  <>
                    <Home className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                  </>
                ) : (
                  <span className="truncate max-w-[160px]">{item.name}</span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
