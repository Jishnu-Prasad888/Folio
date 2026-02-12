import React from 'react'

interface MenuItem {
  label: string
  onClick: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  visible: boolean
  items: MenuItem[]
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, visible, items }) => {
  if (!visible) return null

  return (
    <div
      className="fixed z-50 w-40 rounded-md border border-neutral-200 bg-white shadow-lg dark:border-dark-border dark:bg-dark-base"
      style={{ top: y, left: x }}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted"
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default ContextMenu
