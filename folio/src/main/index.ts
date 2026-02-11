import { app, BrowserWindow, ipcMain,dialog  } from 'electron'
import path from 'path'
import { initializeDatabase } from './database'
import { setupWallpaperHandlers } from './wallpaper'
import { setupImageProcessorHandlers } from './imageProcessor'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

let mainWindow: BrowserWindow | null = null

type TrashItem = {
  id: string
  name: string
  deleted_at: string
  type: 'image' | 'folder'
}


// Initialize database
const db = initializeDatabase()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('get-images', async (event, folderId?: string, search?: string) => {
  try {
    if (search) {
      const query = `
        SELECT i.*, GROUP_CONCAT(t.name) as tags
        FROM images i
        LEFT JOIN image_tags it ON i.id = it.image_id
        LEFT JOIN tags t ON it.tag_id = t.id
        WHERE i.deleted_at IS NULL 
        AND (i.file_path LIKE ? OR EXISTS (
          SELECT 1 FROM notes n WHERE n.image_id = i.id AND n.markdown LIKE ?
        ))
        GROUP BY i.id
        ORDER BY i.created_at DESC
      `
      const searchTerm = `%${search}%`
      const images = db.prepare(query).all(searchTerm, searchTerm)
      return { success: true, data: images }
    }

    if (folderId) {
      const images = db.prepare(`
        SELECT i.*, GROUP_CONCAT(t.name) as tags
        FROM images i
        LEFT JOIN image_tags it ON i.id = it.image_id
        LEFT JOIN tags t ON it.tag_id = t.id
        WHERE i.folder_id = ? AND i.deleted_at IS NULL
        GROUP BY i.id
        ORDER BY i.created_at DESC
      `).all(folderId)
      return { success: true, data: images }
    }

    const images = db.prepare(`
      SELECT i.*, GROUP_CONCAT(t.name) as tags
      FROM images i
      LEFT JOIN image_tags it ON i.id = it.image_id
      LEFT JOIN tags t ON it.tag_id = t.id
      WHERE i.deleted_at IS NULL
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `).all()
    return { success: true, data: images }
  } catch (error) {
    return { success: false, message: 'Failed to fetch images' }
  }
})

ipcMain.handle('create-folder', async (event, name: string, parentId?: string) => {
  try {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    db.prepare(`
      INSERT INTO folders (id, name, parent_id, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, name, parentId || null, now)
    
    return { success: true, data: { id, name, parent_id: parentId, created_at: now } }
  } catch (error) {
    return { success: false, message: 'Failed to create folder' }
  }
})

ipcMain.handle('delete-folder', async (event, id: string) => {
  try {
    const now = new Date().toISOString()
    db.prepare('UPDATE folders SET deleted_at = ? WHERE id = ?').run(now, id)
    return { success: true }
  } catch (error) {
    return { success: false, message: 'Failed to delete folder' }
  }
})

ipcMain.handle('update-folder', async (event, id: string, updates: { name?: string }) => {
  try {
    if (updates.name) {
      db.prepare('UPDATE folders SET name = ? WHERE id = ?').run(updates.name, id)
    }
    return { success: true }
  } catch (error) {
    return { success: false, message: 'Failed to update folder' }
  }
})

ipcMain.handle('get-trash', async () => {
  try {
    // Get deleted images
    const deletedImages = db.prepare(`
      SELECT id, file_path as name, deleted_at, 'image' as type
      FROM images 
      WHERE deleted_at IS NOT NULL
    `).all()

    // Get deleted folders
    const deletedFolders = db.prepare(`
      SELECT id, name, deleted_at, 'folder' as type
      FROM folders 
      WHERE deleted_at IS NOT NULL
    `).all()

    const trash = ([...deletedImages, ...deletedFolders] as TrashItem[])
  .sort((a, b) =>
    new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
  )



    return { success: true, data: trash }
  } catch (error) {
    return { success: false, message: 'Failed to fetch trash' }
  }
})

ipcMain.handle('empty-trash', async () => {
  try {
    // Get all deleted images to remove their files
    const deletedImages = db.prepare('SELECT file_path, thumbnail_path FROM images WHERE deleted_at IS NOT NULL').all()
    
    // Remove physical files
    deletedImages.forEach((img: any) => {
      try {
        if (fs.existsSync(img.file_path)) fs.unlinkSync(img.file_path)
        if (fs.existsSync(img.thumbnail_path)) fs.unlinkSync(img.thumbnail_path)
      } catch (error) {
        console.error('Failed to delete file:', error)
      }
    })

    // Delete from database
    db.prepare('DELETE FROM images WHERE deleted_at IS NOT NULL').run()
    db.prepare('DELETE FROM folders WHERE deleted_at IS NOT NULL').run()

    return { success: true }
  } catch (error) {
    return { success: false, message: 'Failed to empty trash' }
  }
})

ipcMain.handle('open-file-dialog', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, data: result.filePaths.length === 1 ? result.filePaths[0] : result.filePaths }
    }
    
    return { success: false, message: 'No file selected' }
  } catch (error) {
    return { success: false, message: 'Failed to open file dialog' }
  }
})

ipcMain.handle('edit-image', async (_event, imageId: string, edit: { operation: string; data: any }) => {
  try {
    const { operation, data } = edit

    if (operation === 'rotate') {
      db.prepare(`
        UPDATE images
        SET rotation = ?, updated_at = ?
        WHERE id = ?
      `).run(data, new Date().toISOString(), imageId)
    }

    if (operation === 'crop') {
      db.prepare(`
        UPDATE images
        SET crop_data = ?, updated_at = ?
        WHERE id = ?
      `).run(JSON.stringify(data), new Date().toISOString(), imageId)
    }

    return { success: true }
  } catch (error) {
    console.error('Edit image failed:', error)
    return { success: false }
  }
})

ipcMain.handle(
  'create-image',
  async (_event, filePath: string, folderId?: string) => {
    try {
      const userDataPath = app.getPath('userData')
      const imagesDir = path.join(userDataPath, 'images', 'original')

      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true })
      }

      const id = uuidv4()
      const ext = path.extname(filePath)
      const newFileName = `${id}${ext}`
      const newPath = path.join(imagesDir, newFileName)

      // Copy file into app storage
      fs.copyFileSync(filePath, newPath)

      // Insert into database
      db.prepare(`
        INSERT INTO images (
          id,
          file_path,
          thumbnail_path,
          folder_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        id,
        newPath,
        newPath, // replace later with actual thumbnail path
        folderId ?? null
      )

      return { success: true, id }
    } catch (error) {
      console.error(error)
      return { success: false }
    }
  }
)
ipcMain.handle('get-settings', async () => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all()

    const settings: Record<string, string> = {}

    rows.forEach((row: any) => {
      settings[row.key] = row.value
    })

    return { success: true, data: settings }
  } catch (error) {
    return { success: false }
  }
})

ipcMain.handle('update-settings', async (_event, updates: Record<string, string>) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `)

    const transaction = db.transaction((entries: [string, string][]) => {
      for (const [key, value] of entries) {
        stmt.run(key, value)
      }
    })

    transaction(Object.entries(updates))

    return { success: true }
  } catch (error) {
    return { success: false }
  }
})



// Setup other handlers
setupWallpaperHandlers(ipcMain, db)
setupImageProcessorHandlers(ipcMain, db)