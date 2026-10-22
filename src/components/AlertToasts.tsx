import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface Toast {
  id: string
  message: string
}

interface AlertToastsProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  // each banner closes itself after 10 seconds
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 10_000)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[#2FE6A6]/40 bg-[#0D1424]/90 p-4 shadow-[0_10px_40px_rgba(47,230,166,0.2)] backdrop-blur-xl"
    >
      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2FE6A6] shadow-[0_0_12px_#2FE6A6]" />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss alert"
        className="cursor-pointer text-xs text-white/40 transition hover:text-white"
      >
        ✕
      </button>
    </motion.div>
  )
}

export default function AlertToasts({ toasts, onDismiss }: AlertToastsProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}