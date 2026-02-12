import React, { useCallback, useState } from 'react'
import { Upload, Image as ImageIcon, X, FolderOpen, Loader2 } from 'lucide-react'
import { useAppStore } from '../../store'
import Button from '../Common/Button'
import Modal from '../Common/Modal'
import { useDropzone } from 'react-dropzone'
import clsx from 'clsx'

interface ElectronFile extends File {
  path: string
}

interface ImageUploadProps {
  isOpen: boolean
  onClose: () => void
  targetFolder?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({ isOpen, onClose, targetFolder }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { loadImages } = useAppStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'] },
    multiple: true
  })

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!selectedFiles.length) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const filePath = (file as ElectronFile).path

        if (filePath) await window.api.createImage(filePath, targetFolder)
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
      }

      await loadImages(targetFolder)
      setSelectedFiles([])
      onClose()
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleOpenFileDialog = async () => {
    try {
      const result = await window.api.openFileDialog()
      if (result.success && result.data) {
        const filePaths = Array.isArray(result.data) ? result.data : [result.data]
        const files = filePaths.map((path: string) => ({
          name: path.split('/').pop() || 'Unknown',
          path,
          size: 0
        }))
        setSelectedFiles((prev) => [...prev, ...(files as any)])
      }
    } catch (err) {
      console.error('Failed to open file dialog:', err)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Images"
      size="lg"
      className="bg-white  rounded-2xl shadow-lg border border-neutral-200 dark:border-dark-border"
    >
      <div className="space-y-8">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={clsx(
            'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-200',
            isDragActive
              ? 'border-orange-500 bg-orange-50'
              : 'border-neutral-300 hover:border-orange-400 bg-white '
          )}
        >
          <input {...getInputProps()} />
          <div
            className={clsx(
              'mb-5 rounded-xl p-5 transition',
              isDragActive ? 'bg-orange-100' : 'bg-orange-100'
            )}
          >
            <Upload className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 ">
            {isDragActive ? 'Drop images here' : 'Drag & drop images'}
          </h3>
          <p className="mt-2 text-sm text-neutral-600 ">or browse files from your computer</p>
          <Button
            variant="secondary"
            icon={FolderOpen}
            onClick={(e) => {
              e.stopPropagation()
              handleOpenFileDialog()
            }}
            className="mt-5"
          >
            Browse Files
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImageUpload
