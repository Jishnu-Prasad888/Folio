import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

export function initializeDatabase() {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'image-knowledge.db')
  
  // Create images directory
  const imagesDir = path.join(userDataPath, 'images')
  const originalDir = path.join(imagesDir, 'original')
  const thumbnailsDir = path.join(imagesDir, 'thumbnails')
  
  if (!fs.existsSync(originalDir)) fs.mkdirSync(originalDir, { recursive: true })
  if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true })

  const db = new Database(dbPath)

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT NULL,
      created_at DATETIME,
      deleted_at DATETIME NULL
    );

    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      file_path TEXT NOT NULL,
      thumbnail_path TEXT NOT NULL,
      folder_id TEXT NULL,
      created_at DATETIME,
      updated_at DATETIME,
      deleted_at DATETIME NULL,
      rotation INTEGER DEFAULT 0,
      crop_data TEXT NULL,
      FOREIGN KEY (folder_id) REFERENCES folders (id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      created_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS image_tags (
      image_id TEXT,
      tag_id TEXT,
      PRIMARY KEY (image_id, tag_id),
      FOREIGN KEY (image_id) REFERENCES images (id),
      FOREIGN KEY (tag_id) REFERENCES tags (id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      image_id TEXT UNIQUE,
      markdown TEXT,
      updated_at DATETIME,
      FOREIGN KEY (image_id) REFERENCES images (id)
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      source_note_id TEXT,
      target_type TEXT,
      target_id TEXT,
      FOREIGN KEY (source_note_id) REFERENCES notes (id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_images_folder_id ON images(folder_id);
    CREATE INDEX IF NOT EXISTS idx_images_deleted_at ON images(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
    CREATE INDEX IF NOT EXISTS idx_folders_deleted_at ON folders(deleted_at);
  `)

  return db
}