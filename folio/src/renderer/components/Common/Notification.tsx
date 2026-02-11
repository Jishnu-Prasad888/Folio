import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X, XCircle } from 'lucide-react'
import clsx from 'clsx'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationProps {
  type: NotificationType
  message: string
  title?: string
  duration?: number
  onClose: () => void
  className?: string
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  title,
  duration = 5000,
  onClose,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bg: 'bg-success-soft',
      text: 'text-success-text',
      border: 'border-success-text/20',
      iconColor: 'text-success-text'
    },
    error: {
      icon: XCircle,
      bg: 'bg-error-soft',
      text: 'text-error-text',
      border: 'border-error-text/20',
      iconColor: 'text-error-text'
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-warning-soft',
      text: 'text-warning-text',
      border: 'border-warning-text/20',
      iconColor: 'text-warning-text'
    },
    info: {
      icon: Info,
      bg: 'bg-neutral-100',
      text: 'text-dark-base',
      border: 'border-base-border',
      iconColor: 'text-primary-500'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  if (!isVisible) return null

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 w-80 animate-slide-up rounded-2xl border p-4 shadow-lg",
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={clsx("h-5 w-5 flex-shrink-0", config.iconColor)} />
        
        <div className="flex-1">
          {title && (
            <h4 className="font-ui text-sm font-medium mb-1">{title}</h4>
          )}
          <p className="font-body text-sm">{message}</p>
        </div>

        <button
          onClick={handleClose}
          className="ml-2 flex-shrink-0 rounded-lg p-1 hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default Notification