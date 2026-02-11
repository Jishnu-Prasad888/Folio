import React, { useState, useEffect } from 'react'
import { User, Moon, Sun, HardDrive } from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useAppStore()
  const [userName, setUserName] = useState('')
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 })

  useEffect(() => {
    // Load user settings
    window.api.getSettings().then((response) => {
      if (response.success) {
  setUserName(response.data?.name || '')
}

    })

    // Calculate storage usage (simplified)
    const calculateStorage = async () => {
      // This would normally calculate actual storage usage
      setStorageInfo({ used: 2.5, total: 10 })
    }
    calculateStorage()
  }, [])

  const handleSaveSettings = async () => {
    await window.api.updateSettings({ name: userName })
  }

  const storagePercentage = (storageInfo.used / storageInfo.total) * 100

  return (
    <div className="h-full space-y-6">
      <div>
        <h1 className="font-heading text-2xl">Settings</h1>
        <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
          Manage your application preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-2 dark:bg-primary-900/30">
              <User className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h3 className="font-heading text-lg">Profile</h3>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
                Your account information
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block font-ui text-sm font-medium">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input w-full"
                placeholder="Enter your name"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleSaveSettings}
              className="w-full"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent-lavender/20 p-2">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-accent-plum" />
              ) : (
                <Sun className="h-5 w-5 text-accent-plum" />
              )}
            </div>
            <div>
              <h3 className="font-heading text-lg">Appearance</h3>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
                Customize the look and feel
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-ui text-sm">Theme</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    theme === 'light'
                      ? 'bg-primary-400 text-white'
                      : 'bg-neutral-100 dark:bg-dark-muted'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    theme === 'dark'
                      ? 'bg-primary-400 text-white'
                      : 'bg-neutral-100 dark:bg-dark-muted'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent-teal/10 p-2">
              <HardDrive className="h-5 w-5 text-accent-teal" />
            </div>
            <div>
              <h3 className="font-heading text-lg">Storage</h3>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
                Manage your local storage
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-ui">{storageInfo.used.toFixed(1)} GB of {storageInfo.total} GB used</span>
                <span className="text-neutral-500">{storagePercentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-dark-muted">
                <div
                  className="h-full rounded-full bg-accent-teal"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                // Clear cache functionality
              }}
            >
              Clear Cache
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings