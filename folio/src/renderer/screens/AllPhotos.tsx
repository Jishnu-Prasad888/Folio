import React, { useState } from 'react'
import { Search, ImagePlus } from 'lucide-react'
import ImageGrid from '../components/Image/ImageGrid'

const AllPhotos: React.FC = () => {
  return (
    <div className="flex h-full flex-col">
      {/* FULL EXPANSION CONTENT AREA */}
      <div className="flex-1 px-1 pb-2 pt-3">
        <div className="card h-full w-full p-1 overflow-y-auto">
          <ImageGrid />
        </div>
      </div>
    </div>
  )
}

export default AllPhotos
