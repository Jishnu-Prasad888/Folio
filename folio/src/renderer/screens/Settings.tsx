import React, { useState, useEffect } from 'react'
import { User, Moon, Sun, HardDrive } from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'
import clsx from 'clsx'

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useAppStore()
  const [userName, setUserName] = useState('')
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 })

  useEffect(() => {
    window.api.getSettings().then((response) => {
      if (response.success) {
        setUserName(response.data?.name || '')
      }
    })

    const calculateStorage = async () => {
      setStorageInfo({ used: 2.5, total: 10 })
    }

    calculateStorage()
  }, [])

  const handleSaveSettings = async () => {
    await window.api.updateSettings({ name: userName })
  }

  const storagePercentage = storageInfo.total > 0 ? (storageInfo.used / storageInfo.total) * 100 : 0

  return (
    <div className="h-full px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Manage your preferences and application behavior
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile */}
        <div className="card space-y-6 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#FF5B04]/10 p-3">
              <User className="h-5 w-5 text-[#FF5B04]" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">Profile</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Update your personal details
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input w-full"
                placeholder="Enter your name"
              />
            </div>

            <Button variant="primary" onClick={handleSaveSettings} className="w-full">
              Save Changes
            </Button>
          </div>
        </div>

        {/* Appearance */}
        <div className="card space-y-6 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-accent-lavender/20 p-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-accent-plum" />
              ) : (
                <Sun className="h-5 w-5 text-accent-plum" />
              )}
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">Appearance</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Choose how Pictura looks
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div>
            <label className="mb-3 block text-sm font-medium">Theme</label>

            <div className="inline-flex rounded-xl bg-neutral-100 p-1 dark:bg-dark-muted">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={clsx(
                  'rounded-lg px-4 py-2 text-sm transition-colors',
                  theme === 'light'
                    ? 'bg-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300'
                )}
              >
                Light
              </button>

              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={clsx(
                  'rounded-lg px-4 py-2 text-sm transition-colors',
                  theme === 'dark' ? 'bg-white shadow-sm' : 'text-neutral-600 dark:text-neutral-300'
                )}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="card space-y-6 transition-shadow hover:shadow-md md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-accent-teal/10 p-3">
              <HardDrive className="h-5 w-5 text-accent-teal" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold">Storage</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Monitor and manage local storage usage
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>
                  {storageInfo.used.toFixed(1)} GB of {storageInfo.total} GB used
                </span>
                <span className="text-neutral-500">{storagePercentage.toFixed(0)}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-dark-muted">
                <div
                  className="h-full rounded-full bg-accent-teal transition-all duration-500"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>

            <Button variant="secondary" className="w-full">
              Clear Cache
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
