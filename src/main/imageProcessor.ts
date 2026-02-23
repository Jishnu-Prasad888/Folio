import { IpcMain, app } from 'electron'
import Database from 'better-sqlite3'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export function setupImageProcessorHandlers(ipcMain: IpcMain, db: Database.Database) {
  /* ===========================
     CREATE IMAGE
  ============================ */
  ipcMain.handle('create-image', async (_, filePath: string, folderId?: string) => {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, message: 'File does not exist' }
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()

      const userDataPath = app.getPath('userData')
      const originalDir = path.join(userDataPath, 'images', 'original')
      const thumbnailsDir = path.join(userDataPath, 'images', 'thumbnails')

      // ✅ Ensure directories exist
      fs.mkdirSync(originalDir, { recursive: true })
      fs.mkdirSync(thumbnailsDir, { recursive: true })

      // Copy original
      const originalFilename = `${id}${path.extname(filePath)}`
      const originalPath = path.join(originalDir, originalFilename)
      fs.copyFileSync(filePath, originalPath)

      // Generate thumbnail
      const thumbnailFilename = `${id}_thumb.jpg`
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename)

      await sharp(originalPath)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath)

      // Insert into database
      db.prepare(
        `
        INSERT INTO images (
          id,
          file_path,
          thumbnail_path,
          folder_id,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `
      ).run(id, originalPath, thumbnailPath, folderId || null, now, now)

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

  /* ===========================
     GET IMAGES (YOU WERE MISSING THIS)
  ============================ */
  ipcMain.handle('get-images', async (_, folderId?: string, search?: string) => {
    try {
      let query = `
        SELECT * FROM images
      `
      const params: any[] = []

      if (folderId) {
        query += ` WHERE folder_id = ?`
        params.push(folderId)
      }

      query += ` ORDER BY created_at DESC`

      const images = db.prepare(query).all(...params)

      return { success: true, data: images }
    } catch (error) {
      console.error('Get images error:', error)
      return { success: false, message: 'Failed to load images' }
    }
  })

  /* ===========================
     DELETE IMAGE (SOFT DELETE)
  ============================ */
  ipcMain.handle('delete-image', async (_, id: string) => {
    try {
      db.prepare(
        `
        DELETE FROM images WHERE id = ?
      `
      ).run(id)

      return { success: true }
    } catch (error) {
      console.error('Delete image error:', error)
      return { success: false, message: 'Failed to delete image' }
    }
  })

  /* ===========================
     EDIT IMAGE
  ============================ */
  ipcMain.handle('edit-image', async (_, id: string, operation: string, data?: any) => {
    try {
      const image = db.prepare('SELECT * FROM images WHERE id = ?').get(id) as any

      if (!image) {
        return { success: false, message: 'Image not found' }
      }

      let processed = sharp(image.file_path)

      switch (operation) {
        case 'rotate':
          processed = processed.rotate(90)
          break

        case 'flip-horizontal':
          processed = processed.flop()
          break

        case 'flip-vertical':
          processed = processed.flip()
          break

        case 'crop':
          if (data && data.x !== undefined) {
            processed = processed.extract(data)
          }
          break

        default:
          return { success: false, message: 'Unsupported operation' }
      }

      await processed
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(image.thumbnail_path)

      db.prepare(
        `
        UPDATE images
        SET updated_at = ?
        WHERE id = ?
      `
      ).run(new Date().toISOString(), id)

      return { success: true }
    } catch (error) {
      console.error('Edit image error:', error)
      return { success: false, message: 'Failed to edit image' }
    }
  })
}
