import React, { useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { useAppStore } from '../../store'
import ImageCard from './ImageCard'
import { Image as ImageIcon } from 'lucide-react'

interface ImageGridProps {
  onContextMenu: (e: React.MouseEvent) => void
}

const ImageGrid: React.FC<ImageGridProps> = ({ onContextMenu }) => {
  const { images, loadImages, currentFolder, isLoading } = useAppStore()

  /** Load images when folder changes */
  useEffect(() => {
    const folder = currentFolder && currentFolder !== 'folders' ? currentFolder : undefined
    loadImages(folder)
  }, [currentFolder, loadImages])

  /** Group + sort images by date (newest first) */
  const groupedImages = useMemo(() => {
    const groups: Record<string, typeof images> = {}
    images.forEach((image) => {
      if (!image.created_at) return
      const dateObj = new Date(image.created_at)
      if (isNaN(dateObj.getTime())) return
      const formattedDate = format(dateObj, 'MMMM d, yyyy')
      if (!groups[formattedDate]) groups[formattedDate] = []
      groups[formattedDate].push(image)
    })
    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [images])

  /** Wrapper for context menu to prevent default */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onContextMenu(e)
  }

  /** Empty state */
  if (!isLoading && images.length === 0) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center text-center"
        onContextMenu={handleContextMenu}
      >
        <div className="card-alt mb-6 flex flex-col items-center p-8">
          <ImageIcon className="mb-4 h-24 w-24 opacity-40" />
          <h3 className="font-heading text-xl font-semibold">No images yet</h3>
          <p className="font-body mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Upload your first image to get started.
          </p>
        </div>
      </div>
    )
  }

  /** Loading state */
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="glass rounded-3xl p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF5B04] border-t-transparent" />
        </div>
      </div>
    )
  }

  /** Main Grid */
  return (
    <div className="h-full space-y-10 px-2 md:px-4" onContextMenu={handleContextMenu}>
      {groupedImages.map(([date, dateImages]) => (
        <section key={date}>
          <h2 className="mb-2 mt-2 ml-1 font-heading text-medium">{date}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {dateImages.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default ImageGrid
