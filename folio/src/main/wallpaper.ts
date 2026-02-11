import { IpcMain } from 'electron'
import Database from 'better-sqlite3'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

export function setupWallpaperHandlers(ipcMain: IpcMain, db: Database.Database) {
  ipcMain.handle('set-wallpaper', async (event, imageId: string) => {
    try {
      const image = db.prepare('SELECT file_path FROM images WHERE id = ?').get(imageId) as { file_path: string }
      
      if (!image || !fs.existsSync(image.file_path)) {
        return { success: false, message: 'Image not found' }
      }

      const platform = process.platform
      const filePath = image.file_path

      switch (platform) {
        case 'win32':
          // Windows
          await execAsync(`powershell -command "Add-Type -TypeDefinition @' 
            using System; 
            using System.Runtime.InteropServices; 
            public class Wallpaper { 
              [DllImport("user32.dll", CharSet = CharSet.Auto)] 
              public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); 
            } 
          '@; [Wallpaper]::SystemParametersInfo(20, 0, '${filePath.replace(/\\/g, '\\\\')}', 0)"`)
          break

        case 'darwin':
          // macOS
          await execAsync(`osascript -e 'tell application "Finder" to set desktop picture to POSIX file "${filePath}"'`)
          break

        case 'linux':
          // Linux - try to detect desktop environment
          const desktopEnv = process.env.XDG_CURRENT_DESKTOP || ''
          
          if (desktopEnv.toLowerCase().includes('gnome')) {
            await execAsync(`gsettings set org.gnome.desktop.background picture-uri "file://${filePath}"`)
          } else if (desktopEnv.toLowerCase().includes('kde')) {
            await execAsync(`qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript \`
              var allDesktops = desktops();
              for (i=0;i<allDesktops.length;i++) {
                d = allDesktops[i];
                d.wallpaperPlugin = "org.kde.image";
                d.currentConfigGroup = Array("Wallpaper", "org.kde.image", "General");
                d.writeConfig("Image", "file://${filePath}")
              }
            \``)
          } else {
            // Fallback for other desktop environments
            await execAsync(`pcmanfm --set-wallpaper="${filePath}"`)
          }
          break

        default:
          return { success: false, message: `Unsupported platform: ${platform}` }
      }

      return { success: true }
    } catch (error) {
      console.error('Wallpaper error:', error)
      return { success: false, message: 'Failed to set wallpaper' }
    }
  })
}