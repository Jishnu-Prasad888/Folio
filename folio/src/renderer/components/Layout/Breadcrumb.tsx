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
  const { folders, currentFolder } = useAppStore()
  const [breadcrumbItems, setBreadcrumbItems] = React.useState<BreadcrumbItem[]>([])

  React.useEffect(() => {
    if (!currentFolder) {
      setBreadcrumbItems([{ id: null, name: 'All Photos', type: 'root' }])
      return
    }

    const buildBreadcrumb = () => {
      const items: BreadcrumbItem[] = []
      let current = folders.find(f => f.id === currentFolder)
      
      // Start from current folder and go up the hierarchy
      while (current) {
        items.unshift({
          id: current.id,
          name: current.name,
          type: 'folder'
        })
        
        current = current.parent_id 
          ? folders.find(f => f.id === current!.parent_id)
          : undefined
      }
      
      // Add root at the beginning
      items.unshift({ id: null, name: 'Folders', type: 'root' })
      
      return items
    }

    setBreadcrumbItems(buildBreadcrumb())
  }, [currentFolder, folders])

  if (breadcrumbItems.length <= 1) return null

  return (
    <nav className="flex items-center" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        {breadcrumbItems.map((item, index) => (
          <li key={item.id || 'root'} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-neutral-400" />
            )}
            
            <button
              onClick={() => {
                // TODO: Navigate to folder
              }}
              className={clsx(
                "rounded-lg px-2 py-1 text-sm transition-colors",
                index === breadcrumbItems.length - 1
                  ? "font-ui font-medium text-primary-500"
                  : "font-body text-neutral-600 hover:bg-neutral-100 hover:text-dark-base dark:text-neutral-400 dark:hover:bg-dark-muted"
              )}
              aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined}
            >
              {index === 0 ? (
                <Home className="inline h-3 w-3" />
              ) : (
                item.name
              )}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb