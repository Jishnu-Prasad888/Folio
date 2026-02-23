import { IpcMain } from 'electron'
import Database from 'better-sqlite3'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import sharp from 'sharp'
import os from 'os'
import path from 'path'

const execAsync = promisify(exec)

export function setupWallpaperHandlers(ipcMain: IpcMain, db: Database.Database) {
  ipcMain.handle('set-wallpaper', async (_event, imageId: string) => {
    try {
      const image = db.prepare('SELECT file_path FROM images WHERE id = ?').get(imageId) as
        | { file_path: string }
        | undefined

      if (!image || !fs.existsSync(image.file_path)) {
        return { success: false, message: 'Image not found' }
      }

      const platform = process.platform
      const filePath = image.file_path

      switch (platform) {
        case 'win32': {
          const safeTempPath = path.join(os.tmpdir(), 'wallpaper_temp.png')

          await sharp(filePath)
            .flatten({ background: { r: 0, g: 0, b: 0 } })
            .toFormat('png')
            .toFile(safeTempPath)

          // Use forward slashes - PowerShell handles them fine
          const normalizedPath = safeTempPath.replace(/\\/g, '/')

          const psScript = `
Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name WallpaperStyle -Value 6
Set-ItemProperty -Path "HKCU:\\Control Panel\\Desktop" -Name TileWallpaper -Value 0

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Wallpaper {
  [DllImport("user32.dll", CharSet = CharSet.Auto)]
  public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@

[Wallpaper]::SystemParametersInfo(20, 0, "${normalizedPath}", 3)
`
          const encoded = Buffer.from(psScript, 'utf16le').toString('base64')
          await execAsync(`powershell -NoProfile -EncodedCommand ${encoded}`)
          break
        }
        case 'darwin': {
          const escapedPath = filePath.replace(/"/g, '\\"')
          await execAsync(
            `osascript -e 'tell application "Finder" to set desktop picture to POSIX file "${escapedPath}"'`
          )
          break
        }

        case 'linux': {
          const desktopEnv = (process.env.XDG_CURRENT_DESKTOP || '').toLowerCase()

          if (desktopEnv.includes('gnome')) {
            await execAsync(
              `gsettings set org.gnome.desktop.background picture-uri "file://${filePath}"`
            )
          } else if (desktopEnv.includes('kde')) {
            const kdeScript = `
var allDesktops = desktops();
for (var i = 0; i < allDesktops.length; i++) {
  var d = allDesktops[i];
  d.wallpaperPlugin = "org.kde.image";
  d.currentConfigGroup = ["Wallpaper", "org.kde.image", "General"];
  d.writeConfig("Image", "file://${filePath}");
}
`
            await execAsync(
              `qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "${kdeScript.replace(
                /\n/g,
                ''
              )}"`
            )
          } else {
            await execAsync(`pcmanfm --set-wallpaper="${filePath}"`)
          }

          break
        }

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
