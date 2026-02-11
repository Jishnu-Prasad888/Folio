import React, { useState, useRef, useEffect } from 'react'
import { Crop, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Check, X } from 'lucide-react'
import { Image } from '../../types'
import Button from '../Common/Button'
import Modal from '../Common/Modal'
import { useAppStore } from '../../store'

interface CropData {
  x: number
  y: number
  width: number
  height: number
}

interface ImageEditorProps {
  image: Image
  isOpen: boolean
  onClose: () => void
  onSave: (editedImage: Image) => void
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  isOpen,
  onClose,
  onSave
}) => {
  const [rotation, setRotation] = useState(image.rotation || 0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [cropMode, setCropMode] = useState(false)
  const [cropData, setCropData] = useState<CropData | null>(
    image.crop_data ? JSON.parse(image.crop_data) : null
  )
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })

  const { theme } = useAppStore()

  useEffect(() => {
    if (isOpen && imageRef.current && canvasRef.current) {
      drawImage()
    }
  }, [isOpen, rotation, flipHorizontal, flipVertical, zoom, cropData])

  const drawImage = () => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    canvas.width = 800
    canvas.height = 600

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    // Center the image
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipHorizontal ? -zoom : zoom, flipVertical ? -zoom : zoom)

    // Apply crop if exists
    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height
    if (cropData) {
      sx = cropData.x
      sy = cropData.y
      sWidth = cropData.width
      sHeight = cropData.height
    }

    ctx.drawImage(
      img,
      sx, sy, sWidth, sHeight,
      -img.width / 2, -img.height / 2,
      img.width, img.height
    )

    ctx.restore()

    // Draw crop overlay if in crop mode
    if (cropMode) {
      drawCropOverlay(ctx)
    }
  }

  const drawCropOverlay = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear the center for cropping area
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const cropSize = 400
    ctx.clearRect(centerX - cropSize / 2, centerY - cropSize / 2, cropSize, cropSize)
    
    // Draw crop border
    ctx.strokeStyle = '#FF5B04'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(centerX - cropSize / 2, centerY - cropSize / 2, cropSize, cropSize)
    ctx.setLineDash([])
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleFlipHorizontal = () => {
    setFlipHorizontal(!flipHorizontal)
  }

  const handleFlipVertical = () => {
    setFlipVertical(!flipVertical)
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5))
  }

  const handleCrop = () => {
    if (cropMode) {
      // Apply crop
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const cropSize = 400
      const scaleX = imageRef.current!.width / canvas.width
      const scaleY = imageRef.current!.height / canvas.height

      const cropData: CropData = {
        x: Math.round((canvas.width / 2 - cropSize / 2) * scaleX),
        y: Math.round((canvas.height / 2 - cropSize / 2) * scaleY),
        width: Math.round(cropSize * scaleX),
        height: Math.round(cropSize * scaleY)
      }

      setCropData(cropData)
      setCropMode(false)
    } else {
      setCropMode(true)
    }
  }

  const handleReset = () => {
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setZoom(1)
    setCropData(null)
    setCropMode(false)
  }

  const handleSave = async () => {
    try {
      // Apply edits via IPC
      const edits = []
      if (rotation !== image.rotation) {
        edits.push({ operation: 'rotate', data: rotation })
      }
      if (cropData) {
        edits.push({ operation: 'crop', data: cropData })
      }

      for (const edit of edits) {
        await window.api.editImage(image.id, {
  operation: edit.operation,
  data: edit.data
})

      }

      // Update local state
      const updatedImage = {
        ...image,
        rotation,
        crop_data: cropData ? JSON.stringify(cropData) : undefined
      }
      onSave(updatedImage)
      onClose()
    } catch (error) {
      console.error('Failed to save edits:', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Image"
      size="xl"
      className="h-[80vh]"
    >
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-base-border p-4 dark:border-dark-muted">
          <div className="flex items-center gap-2">
            <Button
              variant={cropMode ? 'primary' : 'secondary'}
              size="sm"
              icon={Crop}
              onClick={handleCrop}
            >
              {cropMode ? 'Apply Crop' : 'Crop'}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCw}
              onClick={handleRotate}
            >
              Rotate
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={FlipHorizontal}
              onClick={handleFlipHorizontal}
            >
              Flip H
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={FlipVertical}
              onClick={handleFlipVertical}
            >
              Flip V
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={ZoomOut}
              onClick={handleZoomOut}
            />
            
            <span className="font-ui text-sm">{Math.round(zoom * 100)}%</span>
            
            <Button
              variant="ghost"
              size="sm"
              icon={ZoomIn}
              onClick={handleZoomIn}
            />
          </div>
        </div>

        {/* Image Canvas */}
        <div className="relative flex-1 overflow-hidden" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-h-full max-w-full rounded-lg"
            />
            <img
              ref={imageRef}
              src={`file://${image.file_path}`}
              alt="Editing preview"
              className="hidden"
              onLoad={drawImage}
            />
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between border-t border-base-border p-4 dark:border-dark-muted">
          <Button
            variant="ghost"
            onClick={handleReset}
          >
            Reset
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={X}
              onClick={onClose}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              icon={Check}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ImageEditor