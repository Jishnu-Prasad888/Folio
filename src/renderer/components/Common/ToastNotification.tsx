import React from 'react'
import clsx from 'clsx'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning'

interface ToastProps {
  id: string
  message: string
  type?: ToastType
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ id, message, type = 'success', onClose }) => {
  const styles = {
    success: {
      icon: CheckCircle,
      accent: 'text-emerald-500'
    },
    error: {
      icon: XCircle,
      accent: 'text-rose-500'
    },
    warning: {
      icon: AlertTriangle,
      accent: 'text-orange-500'
    }
  }

  const Icon = styles[type].icon

  return (
    <div
      className={clsx(
        'relative flex items-center gap-3 overflow-hidden rounded-2xl px-5 py-4',
        'backdrop-blur-xl bg-white/60 dark:bg-white/10',
        'border border-white/40 dark:border-white/10',
        'shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
        'transition-all duration-300'
      )}
    >
      {/* Subtle orange glow accent */}
      <div className="absolute inset-0 bg-linear-to-r from-orange-400/10 via-transparent to-transparent pointer-events-none" />

      <Icon className={clsx('h-5 w-5 shrink-0', styles[type].accent)} />

      <span className="text-sm font-medium text-neutral-800">{message}</span>

      <button
        onClick={() => onClose(id)}
        className="ml-auto text-xs text-neutral-400 transition hover:text-neutral-700 dark:hover:text-white"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
