-- Database schema for Image Knowledge Manager
-- SQLite implementation

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: folders
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (parent_id) REFERENCES folders (id)
);

-- Table: images
CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT NOT NULL,
    folder_id TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    rotation INTEGER DEFAULT 0,
    crop_data TEXT NULL,
    FOREIGN KEY (folder_id) REFERENCES folders (id)
);

-- Table: tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: image_tags (many-to-many relationship)
CREATE TABLE IF NOT EXISTS image_tags (
    image_id TEXT,
    tag_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (image_id, tag_id),
    FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

-- Table: notes
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    image_id TEXT UNIQUE,
    markdown TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE
);

-- Table: links (for markdown internal linking)
CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    source_note_id TEXT,
    target_type TEXT NOT NULL CHECK (target_type IN ('image', 'folder')),
    target_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_note_id) REFERENCES notes (id) ON DELETE CASCADE
);

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_folder_id ON images(folder_id);
CREATE INDEX IF NOT EXISTS idx_images_deleted_at ON images(deleted_at);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_deleted_at ON folders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_image_tags_image_id ON image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_image_tags_tag_id ON image_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_notes_image_id ON notes(image_id);
CREATE INDEX IF NOT EXISTS idx_links_source_note_id ON links(source_note_id);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_type, target_id);

-- Triggers for automatic updated_at
CREATE TRIGGER IF NOT EXISTS update_images_timestamp 
AFTER UPDATE ON images 
BEGIN
    UPDATE images SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
AFTER UPDATE ON notes 
BEGIN
    UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
AFTER UPDATE ON settings 
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE key = NEW.key;
END;

-- Initial Data
INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('theme', 'light'),
    ('user_name', ''),
    ('wallpaper_mode', 'fit'),
    ('thumbnail_quality', '80'),
    ('first_run', 'true');