import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Folder operations
  createFolder: (name: string, parentId?: string) =>
    ipcRenderer.invoke('create-folder', name, parentId),
  deleteFolder: (id: string) => ipcRenderer.invoke('delete-folder', id),
  restoreFolder: (id: string) => ipcRenderer.invoke('restore-folder', id),
  getFolders: () => ipcRenderer.invoke('get-folders'),

  // Image operations
  createImage: (filePath: string, folderId?: string) =>
    ipcRenderer.invoke('create-image', filePath, folderId),
  deleteImage: (id: string) => ipcRenderer.invoke('delete-image', id),
  restoreImage: (id: string) => ipcRenderer.invoke('restore-image', id),
  updateImage: (id: string, updates: any) => ipcRenderer.invoke('update-image', id, updates),
  getImages: (folderId?: string, search?: string) =>
    ipcRenderer.invoke('get-images', folderId, search),
  editImage: (imageId: string, edit: any) => ipcRenderer.invoke('edit-image', imageId, edit),

  getSettings: () => ipcRenderer.invoke('get-settings'),

  updateSettings: (updates: Record<string, string>) =>
    ipcRenderer.invoke('update-settings', updates),

  // Tag operations
  getTags: () => ipcRenderer.invoke('get-tags'),
  addTag: (imageId: string, tagName: string) => ipcRenderer.invoke('add-tag', imageId, tagName),
  removeTag: (imageId: string, tagId: string) => ipcRenderer.invoke('remove-tag', imageId, tagId),

  // Note operations
  saveNote: (imageId: string, markdown: string) =>
    ipcRenderer.invoke('save-note', imageId, markdown),
  getNote: (imageId: string) => ipcRenderer.invoke('get-note', imageId),

  // Wallpaper
  setWallpaper: (imageId: string) => ipcRenderer.invoke('set-wallpaper', imageId),

  // Trash operations
  getTrash: () => ipcRenderer.invoke('get-trash'),
  permanentlyDelete: (type: string, id: string) =>
    ipcRenderer.invoke('permanently-delete', type, id),
  emptyTrash: () => ipcRenderer.invoke('empty-trash'),

  // File operations
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  showItemInFolder: (path: string) => ipcRenderer.invoke('show-item-in-folder', path)
})

// Type declarations
declare global {
  interface Window {
    api: {
      createFolder: (name: string, parentId?: string) => Promise<any>
      deleteFolder: (id: string) => Promise<any>
      restoreFolder: (id: string) => Promise<any>
      getFolders: () => Promise<any>
      createImage: (filePath: string, folderId?: string) => Promise<any>
      deleteImage: (id: string) => Promise<any>
      restoreImage: (id: string) => Promise<any>
      updateImage: (id: string, updates: any) => Promise<any>
      getImages: (folderId?: string, search?: string) => Promise<any>
      editImage: (id: string, operation: string, data?: any) => Promise<any>
      getTags: () => Promise<any>
      addTag: (imageId: string, tagName: string) => Promise<any>
      removeTag: (imageId: string, tagId: string) => Promise<any>
      saveNote: (imageId: string, markdown: string) => Promise<any>
      getNote: (imageId: string) => Promise<any>
      setWallpaper: (imageId: string) => Promise<any>
      getTrash: () => Promise<any>
      permanentlyDelete: (type: string, id: string) => Promise<any>
      emptyTrash: () => Promise<any>
      updateSettings: (settings: any) => Promise<any>
      getSettings: () => Promise<any>
      openFileDialog: () => Promise<any>
      showItemInFolder: (path: string) => Promise<any>
    }
  }
}
