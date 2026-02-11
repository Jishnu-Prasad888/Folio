import React, { useState } from 'react'
import { Search, Settings, Bell, User, Sun, Moon } from 'lucide-react'
import { useAppStore } from '../../store'
import Button from '../Common/Button'
import Breadcrumb from './Breadcrumb'

const Topbar: React.FC = () => {
  const { theme, toggleTheme } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Debounce search
    // TODO: Implement search functionality
  }

  return (
    <div className="flex items-center justify-between rounded-3xl border border-base-border bg-base-surface px-6 py-4 dark:border-dark-muted dark:bg-dark-base">
      {/* Left Section - Breadcrumb */}
      <div className="flex items-center gap-4">
        <Breadcrumb />
      </div>

      {/* Right Section - Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search images, tags, or notes..."
            value={searchQuery}
            onChange={handleSearch}
            className="input w-64 pl-10 pr-4"
          />
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          icon={theme === 'dark' ? Sun : Moon}
          onClick={toggleTheme}
          className="rounded-full"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        />

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            icon={Bell}
            onClick={() => setShowNotifications(!showNotifications)}
            className="rounded-full"
          />
          
          {/* Notification Badge */}
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-soft text-xs font-medium text-error-text">
            3
          </span>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-base-border bg-base-surface p-4 shadow-lg dark:border-dark-muted dark:bg-dark-base">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-sm font-medium">Notifications</h3>
                <button className="text-xs text-primary-500 hover:underline">
                  Mark all as read
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="rounded-lg bg-success-soft/50 p-3">
                  <p className="text-xs text-success-text">
                    Image backup completed successfully
                  </p>
                  <span className="text-xs text-neutral-500">2 hours ago</span>
                </div>
                
                <div className="rounded-lg p-3">
                  <p className="text-xs">
                    5 new images added to "Vacation" folder
                  </p>
                  <span className="text-xs text-neutral-500">1 day ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Button
          variant="ghost"
          size="sm"
          icon={Settings}
          onClick={() => {
            // TODO: Navigate to settings
          }}
          className="rounded-full"
        />

        {/* User Avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-400">
          <User className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default Topbar