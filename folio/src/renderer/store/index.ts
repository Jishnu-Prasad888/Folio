import { create } from 'zustand'
import { AppState, AppActions } from '../types'

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // State
  user: null,
  images: [],
  folders: [],
  tags: [],
  trash: [],
  selectedImage: null,
  currentFolder: null,
  theme: 'light',
  isLoading: false,
  error: null,

  // Actions
  loadImages: async (folderId?: string, search?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.getImages(folderId, search)
      if (response.success) {
        set({ images: response.data })
      } else {
        set({ error: response.message })
      }
    } catch (error) {
      set({ error: 'Failed to load images' })
    } finally {
      set({ isLoading: false })
    }
  },

  loadFolders: async () => {
    try {
      const response = await window.api.getFolders()
      if (response.success) {
        set({ folders: response.data })
      }
    } catch (error) {
      set({ error: 'Failed to load folders' })
    }
  },

  loadTags: async () => {
    try {
      const response = await window.api.getTags()
      if (response.success) {
        set({ tags: response.data })
      }
    } catch (error) {
      set({ error: 'Failed to load tags' })
    }
  },

  loadTrash: async () => {
    try {
      const response = await window.api.getTrash()
      if (response.success) {
        set({ trash: response.data })
      }
    } catch (error) {
      set({ error: 'Failed to load trash' })
    }
  },

  addFolder: async (name: string, parentId?: string) => {
    try {
      const response = await window.api.createFolder(name, parentId)
      if (response.success) {
        await get().loadFolders()
      } else {
        set({ error: response.message })
      }
    } catch (error) {
      set({ error: 'Failed to create folder' })
    }
  },

  deleteImage: async (id: string) => {
    try {
      const response = await window.api.deleteImage(id)
      if (response.success) {
        await get().loadImages()
      } else {
        set({ error: response.message })
      }
    } catch (error) {
      set({ error: 'Failed to delete image' })
    }
  },

  restoreItem: async (type: 'image' | 'folder', id: string) => {
    try {
      const response = type === 'image' 
        ? await window.api.restoreImage(id)
        : await window.api.restoreFolder(id)
      
      if (response.success) {
        await get().loadTrash()
        if (type === 'image') {
          await get().loadImages()
        } else {
          await get().loadFolders()
        }
      }
    } catch (error) {
      set({ error: 'Failed to restore item' })
    }
  },

  permanentlyDelete: async (type: 'image' | 'folder', id: string) => {
    try {
      const response = await window.api.permanentlyDelete(type, id)
      if (response.success) {
        await get().loadTrash()
      }
    } catch (error) {
      set({ error: 'Failed to permanently delete item' })
    }
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
  },

  setSelectedImage: (image) => set({ selectedImage: image }),

  setCurrentFolder: (folderId) => set({ currentFolder: folderId }),

  setError: (error) => set({ error })
}))