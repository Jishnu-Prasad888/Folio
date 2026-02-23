import React, { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Trash2, Edit3, Link as LinkIcon, Monitor } from 'lucide-react'
import { Image } from '../../types'
import { useAppStore } from '../../store'
import Button from '../Common/Button'
import { useToast } from '../Common/ToastProvider'

interface ImageCardProps {
  image: Image
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const { deleteImage } = useAppStore()
  const [showActions, setShowActions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [] = useState(false)
  const { showToast } = useToast()
  /**
   * Close dropdown on outside click
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  const handleDelete = () => {
    if (window.confirm('Move this image to trash?')) {
      deleteImage(image.id)
      setShowActions(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      const link = `${image.file_path.replace(/\\/g, '/')}`
      await navigator.clipboard.writeText(link)

      showToast('Link copied to clipboard', 'success')
      setShowActions(false)
    } catch (err) {
      showToast('Failed to copy link', 'error')
    }
  }

  const handleSetWallpaper = async () => {
    try {
      await window.api?.setWallpaper?.(image.id)
      showToast('Wallpaper set successfully', 'success')
      setShowActions(false)
    } catch (err) {
      showToast('Error in setting the wallpaper', 'error')
      console.error(err)
    }
  }

  const parsedTags =
    image.tags
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean) ?? []

  return (
    <div ref={wrapperRef} className="relative">
      {/* Card */}
      <div className="group relative overflow-hidden rounded-3xl border border-[#D8E2E6] bg-white transition-all duration-200 hover:scale-[1.02] dark:border-dark-muted dark:bg-dark-base">
        {/* Image */}
        <div className="aspect-square overflow-hidden">
          {image.thumbnail_path ? (
            <img
              src={`folio:///${image.thumbnail_path.replace(/\\/g, '/')}`}
              alt="thumbnail"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-200 text-sm text-neutral-500 dark:bg-dark-muted">
              No Thumbnail
            </div>
          )}
        </div>

        {/* Minimal Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* Top Right More Button */}
        <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions((prev) => !prev)
            }}
            className="bg-white/20 text-white backdrop-blur hover:bg-white/30"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Tags */}
        {parsedTags.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            {parsedTags.map((tag, index) => (
              <span key={index} className="tag bg-[#ECD0DE]/90 backdrop-blur">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* OUTSIDE DROPDOWN */}
      {showActions && (
        <div className="absolute top-0 right-0 z-30 translate-x-full ml-3 w-52 rounded-2xl border border-[#D8E2E6] bg-white p-2 shadow-xl dark:border-dark-muted dark:bg-dark-base">
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted">
            <Edit3 className="h-4 w-4" />
            Edit Details
          </button>

          <button
            onClick={handleCopyLink}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted"
          >
            <LinkIcon className="h-4 w-4" />
            Copy Link
          </button>

          <button
            onClick={handleSetWallpaper}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-dark-muted"
          >
            <Monitor className="h-4 w-4" />
            Set as Wallpaper
          </button>

          <div className="my-2 border-t border-[#D8E2E6] dark:border-dark-muted" />

          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#8B3A4A] hover:bg-[#FCE8EC]"
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
