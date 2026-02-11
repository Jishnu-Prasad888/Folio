import React from 'react'
import { 
  Home, 
  Folder, 
  Settings, 
  Trash2,
  Image as ImageIcon,
  FolderPlus
} from 'lucide-react'
import { useAppStore } from '../../store'
import clsx from 'clsx'

const Sidebar: React.FC = () => {
  const { currentFolder, setCurrentFolder, theme } = useAppStore()

  const navItems = [
    { id: null, icon: Home, label: 'All Photos' },
    { id: 'folders', icon: Folder, label: 'Folders' },
    { id: 'trash', icon: Trash2, label: 'Trash' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className={clsx(
      "flex h-full w-64 flex-col rounded-3xl border border-base-border bg-base-surface p-4",
      theme === 'dark' && "border-dark-muted bg-dark-base"
    )}>
      <div className="mb-8">
        <h1 className="font-branding text-2xl text-primary-500">Pictura</h1>
        <p className="font-body text-sm text-neutral-600 dark:text-neutral-300">
          Image Knowledge Manager
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setCurrentFolder(item.id)}
            className={clsx(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-colors",
              currentFolder === item.id
                ? "bg-primary-50 text-primary-500 dark:bg-primary-900/30"
                : "hover:bg-neutral-100 dark:hover:bg-dark-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-ui text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="btn-primary mt-4 flex items-center justify-center gap-2">
        <ImageIcon className="h-4 w-4" />
        Add Image
      </button>
      
      <button className="btn-secondary mt-2 flex items-center justify-center gap-2">
        <FolderPlus className="h-4 w-4" />
        New Folder
      </button>
    </div>
  )
}

export default Sidebar