import React, { useState, useRef, useEffect, useCallback, useReducer } from 'react'
import { Crop, RotateCw, Undo2, Redo2, Check, X } from 'lucide-react'
import { Image } from '../../types'
import Button from '../Common/Button'
import Modal from '../Common/Modal'

interface CropData {
  x: number
  y: number
  width: number
  height: number
}

interface EditorState {
  rotation: number
  zoom: number
  flipH: boolean
  flipV: boolean
  crop: CropData | null
  panX: number
  panY: number
}

interface ImageEditorProps {
  image: Image
  isOpen: boolean
  onClose: () => void
  onSave: (img: Image) => void
}

/* -------------------- HISTORY STACK -------------------- */

function historyReducer(state: EditorState[], action: any) {
  switch (action.type) {
    case 'push':
      return [...state, action.payload]
    case 'undo':
      return state.slice(0, -1)
    default:
      return state
  }
}

/* -------------------- COMPONENT -------------------- */

const ImageEditor: React.FC<ImageEditorProps> = ({ image, isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const [editor, setEditor] = useState<EditorState>({
    rotation: 0,
    zoom: 1,
    flipH: false,
    flipV: false,
    crop: null,
    panX: 0,
    panY: 0
  })

  const [cropMode, setCropMode] = useState(false)
  const [isDraggingCrop, setIsDraggingCrop] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })

  const [history, dispatchHistory] = useReducer(historyReducer, [editor])
  const [redoStack, setRedoStack] = useState<EditorState[]>([])

  /* -------------------- DRAW ENGINE -------------------- */

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1000
    canvas.height = 700

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()

    ctx.translate(canvas.width / 2 + editor.panX, canvas.height / 2 + editor.panY)
    ctx.rotate((editor.rotation * Math.PI) / 180)
    ctx.scale(editor.flipH ? -editor.zoom : editor.zoom, editor.flipV ? -editor.zoom : editor.zoom)

    ctx.drawImage(img, -img.width / 2, -img.height / 2)

    ctx.restore()

    if (editor.crop) drawCrop(ctx)
    if (cropMode) drawGuides(ctx)
  }, [editor, cropMode])

  const drawCrop = (ctx: CanvasRenderingContext2D) => {
    const { x, y, width, height } = editor.crop!
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.clearRect(x, y, width, height)

    ctx.strokeStyle = '#FF5B04'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 6])
    ctx.strokeRect(x, y, width, height)
    ctx.setLineDash([])
  }

  const drawGuides = (ctx: CanvasRenderingContext2D) => {
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2

    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.beginPath()
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, ctx.canvas.height)
    ctx.moveTo(0, centerY)
    ctx.lineTo(ctx.canvas.width, centerY)
    ctx.stroke()
  }

  useEffect(() => {
    draw()
  }, [draw])

  /* -------------------- INTERACTION -------------------- */

  const pushHistory = (newState: EditorState) => {
    dispatchHistory({ type: 'push', payload: newState })
    setRedoStack([])
  }

  const updateEditor = (updates: Partial<EditorState>) => {
    const newState = { ...editor, ...updates }
    setEditor(newState)
    pushHistory(newState)
  }

  /* -------------------- MOUSE EVENTS -------------------- */

  const handleMouseDown = (e: React.MouseEvent) => {
    if (cropMode) {
      setIsDraggingCrop(true)
      setStartPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
    } else if (editor.zoom > 1) {
      setIsPanning(true)
      setStartPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCrop) {
      const width = e.nativeEvent.offsetX - startPoint.x
      const height = e.nativeEvent.offsetY - startPoint.y

      setEditor((prev) => ({
        ...prev,
        crop: {
          x: startPoint.x,
          y: startPoint.y,
          width,
          height
        }
      }))
    }

    if (isPanning) {
      const dx = e.clientX - startPoint.x
      const dy = e.clientY - startPoint.y

      setEditor((prev) => ({
        ...prev,
        panX: prev.panX + dx,
        panY: prev.panY + dy
      }))

      setStartPoint({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDraggingCrop(false)
    setIsPanning(false)
  }

  /* -------------------- KEYBOARD SHORTCUTS -------------------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r') updateEditor({ rotation: editor.rotation + 90 })
      if (e.key === 'c') setCropMode((prev) => !prev)
      if (e.key === '+') updateEditor({ zoom: Math.min(editor.zoom + 0.1, 3) })
      if (e.key === '-') updateEditor({ zoom: Math.max(editor.zoom - 0.1, 0.5) })
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editor])

  /* -------------------- UNDO / REDO -------------------- */

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1)
      setRedoStack((prev) => [history[history.length - 1], ...prev])
      setEditor(newHistory[newHistory.length - 1])
      dispatchHistory({ type: 'undo' })
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0]
      setEditor(next)
      pushHistory(next)
      setRedoStack((prev) => prev.slice(1))
    }
  }

  /* -------------------- SAVE -------------------- */

  const handleSave = () => {
    onSave({
      ...image,
      rotation: editor.rotation,
      crop_data: editor.crop ? JSON.stringify(editor.crop) : undefined
    })
    onClose()
  }

  /* -------------------- UI -------------------- */

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advanced Image Editor" size="xl">
      <div className="flex h-[85vh] flex-col bg-neutral-50">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b p-4 bg-white">
          <div className="flex gap-2">
            <Button icon={Crop} onClick={() => setCropMode((p) => !p)} />
            <Button
              icon={RotateCw}
              onClick={() => updateEditor({ rotation: editor.rotation + 90 })}
            />
            <Button icon={Undo2} onClick={handleUndo} />
            <Button icon={Redo2} onClick={handleRedo} />
          </div>

          <div className="flex items-center gap-3 w-72">
            <input
              type="range"
              min="0"
              max="360"
              value={editor.rotation}
              onChange={(e) => updateEditor({ rotation: Number(e.target.value) })}
              className="w-full"
            />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={editor.zoom}
              onChange={(e) => updateEditor({ zoom: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Canvas */}
        <div
          className={`flex-1 flex items-center justify-center transition-all duration-300 ${
            cropMode ? 'bg-black/80' : 'bg-neutral-100'
          }`}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="rounded-lg shadow-lg cursor-crosshair"
          />
          <img
            ref={imgRef}
            src={`folio://${image.file_path}`}
            alt=""
            className="hidden"
            onLoad={draw}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-white">
          <Button variant="secondary" icon={X} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={Check} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImageEditor
