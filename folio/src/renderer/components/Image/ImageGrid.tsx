import React, { useEffect } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useAppStore } from '../../store'
import ImageCard from './ImageCard'
import { format } from 'date-fns'

const ImageGrid: React.FC = () => {
  const { images, loadImages, currentFolder, isLoading } = useAppStore()

  useEffect(() => {
    loadImages(currentFolder === 'folders' ? undefined : currentFolder)
  }, [currentFolder])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="mb-4 rounded-full bg-neutral-100 p-6 dark:bg-dark-muted">
          <img src="/placeholder-image.svg" alt="No images" className="h-24 w-24 opacity-50" />
        </div>
        <h3 className="font-heading text-xl">No images yet</h3>
        <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
          Add your first image to get started
        </p>
      </div>
    )
  }

  // Group images by date
  const groupedImages = images.reduce((groups, image) => {
    const date = format(new Date(image.created_at), 'MMMM d, yyyy')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(image)
    return groups
  }, {} as Record<string, typeof images>)

  return (
    <div className="h-full space-y-8">
      {Object.entries(groupedImages).map(([date, dateImages]) => (
        <div key={date}>
          <h2 className="mb-4 font-heading text-xl">{date}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {dateImages.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ImageGrid