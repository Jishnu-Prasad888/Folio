import React, { useState } from 'react'
import { Search, ImagePlus } from 'lucide-react'
import { useAppStore } from '../store'
import ImageGrid from '../components/Image/ImageGrid'
import Button from '../components/Common/Button'

const AllPhotos: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { theme } = useAppStore()

  const handleAddImage = async () => {
    console.log('Button clicked')

    try {
      console.log('window.api:', window.api)
      const result = await window.api.openFileDialog()
      console.log('Dialog result:', result)
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Debounce search API call
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl">All Photos</h1>
          <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
            Browse all your images
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search images, tags, or notes..."
              value={searchQuery}
              onChange={handleSearch}
              className="input pl-10 pr-4"
            />
          </div>

          <Button variant="primary" icon={ImagePlus} onClick={handleAddImage}>
            Add Image
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-base-border bg-base-surface p-6 dark:border-dark-muted dark:bg-dark-base">
        <ImageGrid />
      </div>
    </div>
  )
}

export default AllPhotos
