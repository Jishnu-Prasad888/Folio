import React, { useCallback, useState } from 'react'
import { Upload, Image as ImageIcon, X, FolderOpen, Loader2 } from 'lucide-react'
import { useAppStore } from '../../store'
import Button from '../Common/Button'
import Modal from '../Common/Modal'
import { useDropzone } from 'react-dropzone'

interface ElectronFile extends File {
  path: string
}


interface ImageUploadProps {
  isOpen: boolean
  onClose: () => void
  targetFolder?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  isOpen,
  onClose,
  targetFolder
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { loadImages } = useAppStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']
    },
    multiple: true
  })

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        
        // In Electron, we need to use the file path instead of File object
        const filePath = (file as ElectronFile).path

        
        if (filePath) {
          await window.api.createImage(filePath, targetFolder)
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
      }

      // Refresh images
      await loadImages(targetFolder)
      
      // Reset and close
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
        // Handle multiple file paths
        const filePaths = Array.isArray(result.data) ? result.data : [result.data]
        const files = filePaths.map((path: string) => ({
          name: path.split('/').pop() || 'Unknown',
          path: path,
          size: 0 // We don't have size info from dialog
        }))
        
        setSelectedFiles(prev => [...prev, ...files as any])
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Images"
      size="lg"
    >
      <div className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors
            ${isDragActive 
              ? 'border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20' 
              : 'border-base-border hover:border-primary-300 dark:border-dark-muted'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="mb-4 rounded-full bg-neutral-100 p-4 dark:bg-dark-muted">
            <Upload className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
          </div>
          
          <h3 className="mb-2 font-heading text-lg">
            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
          </h3>
          
          <p className="mb-4 text-center font-body text-sm text-neutral-600 dark:text-neutral-400">
            or click to browse files
          </p>
          
          <Button
            variant="secondary"
            icon={FolderOpen}
            onClick={(e) => {
              e.stopPropagation()
              handleOpenFileDialog()
            }}
          >
            Browse Files
          </Button>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-ui text-sm font-medium">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFiles([])}
                className="text-error-text hover:bg-error-soft"
              >
                Clear All
              </Button>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-base-border p-3 dark:border-dark-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-dark-muted">
                      <ImageIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-ui text-sm font-medium">
                        {(file as any).name || file.name}
                      </p>
                      <p className="font-body text-xs text-neutral-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => handleRemoveFile(index)}
                    className="text-neutral-500 hover:text-error-text"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-ui">Uploading...</span>
              <span className="text-neutral-500">{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-dark-muted">
              <div
                className="h-full rounded-full bg-primary-400 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            icon={uploading ? Loader2 : Upload}
            isLoading={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ImageUpload