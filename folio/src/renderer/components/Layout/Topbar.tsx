import React, { useState } from 'react'
import { Search, Settings, Bell, User, Sun, Moon } from 'lucide-react'
import { useAppStore } from '../../store'
import Button from '../Common/Button'
import Breadcrumb from './Breadcrumb'
import clsx from 'clsx'

const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="flex items-center justify-between rounded-3xl border border-base-border bg-base-surface px-8 py-4 shadow-sm dark:border-dark-muted dark:bg-dark-base">
      {/* Left - Breadcrumb */}
      <div className="flex items-center">
        <Breadcrumb />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search images, tags, or notes..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-72 rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-4 text-sm transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-dark-muted dark:bg-dark-muted dark:focus:bg-dark-base"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-neutral-200 dark:bg-dark-muted dark:hover:bg-dark-base"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-neutral-200 dark:bg-dark-muted dark:hover:bg-dark-base"
          >
            <Bell className="h-4 w-4" />

            {/* Badge */}
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              3
            </span>
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full z-50 mt-3 w-80 rounded-2xl border border-base-border bg-base-surface p-5 shadow-xl dark:border-dark-muted dark:bg-dark-base">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <button className="text-xs font-medium text-primary-500 hover:underline">
                  Mark all as read
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-success-soft/60 p-3">
                  <p className="text-sm font-medium text-success-text">
                    Backup completed successfully
                  </p>
                  <span className="text-xs text-neutral-500">2 hours ago</span>
                </div>

                <div className="rounded-xl p-3 hover:bg-neutral-50 dark:hover:bg-dark-muted">
                  <p className="text-sm">5 new images added to "Vacation"</p>
                  <span className="text-xs text-neutral-500">1 day ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-neutral-200 dark:bg-dark-muted dark:hover:bg-dark-base">
          <Settings className="h-4 w-4" />
        </button>

        {/* Avatar */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-600 transition hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-400">
          <User className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default Topbar
