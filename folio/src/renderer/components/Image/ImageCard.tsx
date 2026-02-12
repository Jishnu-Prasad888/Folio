import React, { useState } from 'react'
import { MoreHorizontal, Trash2, Edit3, Link as LinkIcon, Monitor, Eye } from 'lucide-react'
import { Image } from '../../types'
import { useAppStore } from '../../store'
import Button from '../Common/Button'
import clsx from 'clsx'

interface ImageCardProps {
  image: Image
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { deleteImage, setSelectedImage, theme } = useAppStore()

  const handleDelete = () => {
    if (window.confirm('Move this image to trash?')) {
      deleteImage(image.id)
    }
  }

  const handleSetWallpaper = async () => {
    try {
      await window.api.setWallpaper(image.id)
    } catch (error) {
      console.error('Failed to set wallpaper:', error)
    }
  }

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-2xl border border-base-border bg-base-surfaceAlt transition-all duration-200 hover:scale-[1.02] hover:border-primary-300',
        theme === 'dark' && 'border-dark-muted bg-dark-base'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="aspect-square overflow-hidden">
        {image.thumbnail_path ? (
          <img
            src={`folio:///${image.thumbnail_path.replace(/\\/g, '/')}`}
            alt="thumbnail"
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load:', image.thumbnail_path)
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-200 text-sm">
            No Thumbnail
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-start justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="bg-error-soft/90 text-error-text hover:bg-error-soft"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(image)}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                /* Open editor */
              }}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                /* Add link */
              }}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetWallpaper}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tags */}
      {image.tags && (
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {image.tags.split(',').map((tag, index) => (
            <span key={index} className="tag bg-accent-lavender/90">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Action Dropdown */}
      {showActions && (
        <div
          className={clsx(
            'absolute right-3 top-10 z-10 w-48 rounded-xl border border-base-border bg-base-surface p-2 shadow-lg',
            theme === 'dark' && 'border-dark-muted bg-dark-base'
          )}
        >
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted">
            <Edit3 className="h-4 w-4" />
            Edit Details
          </button>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted">
            <LinkIcon className="h-4 w-4" />
            Copy Link
          </button>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted">
            <Monitor className="h-4 w-4" />
            Set as Wallpaper
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

export default ImageCard
