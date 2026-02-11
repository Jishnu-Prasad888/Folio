import { IpcMain } from 'electron'
import Database from 'better-sqlite3'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export function setupImageProcessorHandlers(ipcMain: IpcMain, db: Database.Database) {
  ipcMain.handle('create-image', async (event, filePath: string, folderId?: string) => {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, message: 'File does not exist' }
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const userDataPath = app.getPath('userData')
      const originalDir = path.join(userDataPath, 'images', 'original')
      const thumbnailsDir = path.join(userDataPath, 'images', 'thumbnails')

      // Copy original file
      const originalFilename = `${id}${path.extname(filePath)}`
      const originalPath = path.join(originalDir, originalFilename)
      fs.copyFileSync(filePath, originalPath)

      // Create thumbnail
      const thumbnailFilename = `${id}_thumb.jpg`
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename)
      
      await sharp(filePath)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath)

      // Insert into database
      db.prepare(`
        INSERT INTO images (id, file_path, thumbnail_path, folder_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, originalPath, thumbnailPath, folderId || null, now, now)

      return { 
        success: true, 
        data: { 
          id, 
          file_path: originalPath, 
          thumbnail_path: thumbnailPath,
          folder_id: folderId,
          created_at: now 
        } 
      }
    } catch (error) {
      console.error('Create image error:', error)
      return { success: false, message: 'Failed to process image' }
    }
  })

  ipcMain.handle('edit-image', async (event, id: string, operation: string, data?: any) => {
    try {
      const image = db.prepare('SELECT * FROM images WHERE id = ?').get(id) as any
      
      if (!image) {
        return { success: false, message: 'Image not found' }
      }

      const userDataPath = app.getPath('userData')
      const originalPath = image.file_path
      const thumbnailsDir = path.join(userDataPath, 'images', 'thumbnails')
      
      let processed = sharp(originalPath)
      let cropData = image.crop_data ? JSON.parse(image.crop_data) : null

      switch (operation) {
        case 'rotate':
          processed = processed.rotate(90)
          const newRotation = (image.rotation + 90) % 360
          db.prepare('UPDATE images SET rotation = ?, updated_at = ? WHERE id = ?')
            .run(newRotation, new Date().toISOString(), id)
          break

        case 'flip-horizontal':
          processed = processed.flop()
          break

        case 'flip-vertical':
          processed = processed.flip()
          break

        case 'crop':
          if (data && data.x && data.y && data.width && data.height) {
            processed = processed.extract(data)
            cropData = data
          }
          break

        default:
          return { success: false, message: 'Unsupported operation' }
      }

      // Update thumbnail
      const thumbnailPath = path.join(thumbnailsDir, `${id}_thumb.jpg`)
      await processed
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath)

      // Update database
      db.prepare(`
        UPDATE images 
        SET crop_data = ?, updated_at = ?, thumbnail_path = ?
        WHERE id = ?
      `).run(JSON.stringify(cropData), new Date().toISOString(), thumbnailPath, id)

      return { success: true }
    } catch (error) {
      console.error('Edit image error:', error)
      return { success: false, message: 'Failed to edit image' }
    }
  })
}