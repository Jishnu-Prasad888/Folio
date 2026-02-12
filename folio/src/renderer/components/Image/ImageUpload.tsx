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
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']
    },
    multiple: true
  })

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const filePath = (file as ElectronFile).path

        if (filePath) {
          await window.api.createImage(filePath, targetFolder)
        }

        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
      }

      await loadImages(targetFolder)
      setSelectedFiles([])
      onClose()
    } catch (error) {
      console.error('Upload failed:', error)
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
    } catch (error) {
      console.error('Failed to open file dialog:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Images" size="lg">
      <div className="space-y-8">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={clsx(
            'flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-all duration-200',
            isDragActive
              ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
              : 'border-base-border hover:border-primary-300 dark:border-dark-muted'
          )}
        >
          <input {...getInputProps()} />

          <div
            className={clsx(
              'mb-5 rounded-2xl p-5 transition',
              isDragActive
                ? 'bg-primary-100 dark:bg-primary-900/30'
                : 'bg-neutral-100 dark:bg-dark-muted'
            )}
          >
            <Upload className="h-8 w-8 text-neutral-600 dark:text-neutral-300" />
          </div>

          <h3 className="text-lg font-semibold">
            {isDragActive ? 'Drop images here' : 'Drag & drop images'}
          </h3>

          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            or browse files from your computer
          </p>

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

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">{selectedFiles.length} selected</h4>

              <button
                onClick={() => setSelectedFiles([])}
                className="text-sm font-medium text-error-text hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-base-border p-4 transition hover:bg-neutral-50 dark:border-dark-muted dark:hover:bg-dark-muted"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-dark-base">
                      <ImageIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">{(file as any).name || file.name}</p>
                      <p className="text-xs text-neutral-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="rounded-lg p-2 text-neutral-400 transition hover:bg-error-soft hover:text-error-text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Uploading...</span>
              <span className="text-neutral-500">{uploadProgress}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-dark-muted">
              <div
                className="h-full rounded-full bg-primary-400 transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            icon={uploading ? Loader2 : Upload}
            isLoading={uploading}
          >
            {uploading
              ? 'Uploading...'
              : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImageUpload
