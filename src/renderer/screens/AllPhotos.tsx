import React from 'react'
import ImageGrid from '../components/Image/ImageGrid'
import { ToastProvider } from '../components/Common/ToastProvider'
const AllPhotos: React.FC = () => {
  return (
    <ToastProvider>
      <div className="flex h-full flex-col">
        {/* FULL EXPANSION CONTENT AREA */}
        <div className="flex-1 px-1 pb-2 pt-3">
          <div className="card h-full w-full p-1 overflow-y-auto">
            <ImageGrid
              onContextMenu={(e) => {
                e.preventDefault()
                console.log('Context menu opened')
              }}
            />
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}

export default AllPhotos
