import React from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface TagProps {
  name: string
  color?: 'default' | 'lavender' | 'plum' | 'moss' | 'sand' | 'teal'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  onRemove?: () => void
  onClick?: () => void
  className?: string
}

const Tag: React.FC<TagProps> = ({
  name,
  color = 'default',
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  className
}) => {
  const colorClasses = {
    default: 'bg-accent-lavender text-dark-base hover:bg-accent-plum hover:text-white',
    lavender: 'bg-accent-lavender text-dark-base hover:bg-accent-lavender/80',
    plum: 'bg-accent-plum text-white hover:bg-accent-plum/80',
    moss: 'bg-accent-moss text-white hover:bg-accent-moss/80',
    sand: 'bg-accent-sand text-dark-base hover:bg-accent-sand/80',
    teal: 'bg-accent-teal text-white hover:bg-accent-teal/80'
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  }

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-ui transition-colors",
        colorClasses[color],
        sizeClasses[size],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <span>{name}</span>
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

// Tag Input Component
interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
  className?: string
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Add tags...',
  suggestions = [],
  className
}) => {
  const [input, setInput] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag])
    }
    setInput('')
    setShowSuggestions(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      handleAddTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1])
    }
  }

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(suggestion)
  )

  return (
    <div className={clsx("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Tag
            key={index}
            name={tag}
            removable
            onRemove={() => handleRemoveTag(tag)}
          />
        ))}
        
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="input min-w-[120px] border-none bg-transparent px-2 py-1 focus:ring-0"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-base-border bg-base-surface shadow-lg">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100"
                  onMouseDown={() => handleAddTag(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="font-body text-xs text-neutral-500">Suggestions:</span>
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleAddTag(suggestion)}
              className="text-xs text-primary-500 hover:underline"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Tag