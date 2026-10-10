import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(({ type = 'info', title, message, duration = 4000, action = null }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    setToasts((prev) => [...prev, { id, type, title, message, action }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    return id
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none select-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success'
          const isError = toast.type === 'error'
          const isWarning = toast.type === 'warning'

          const Icon = isSuccess
            ? CheckCircle2
            : isError
            ? AlertCircle
            : isWarning
            ? AlertTriangle
            : Info

          const bgClass = isSuccess
            ? 'bg-[#FFFFFF] border-[#B8E0C5] text-[#101d26]'
            : isError
            ? 'bg-[#FFFFFF] border-[#F1B5AC] text-[#101d26]'
            : isWarning
            ? 'bg-[#FFFFFF] border-[#F1D6A4] text-[#101d26]'
            : 'bg-[#FFFFFF] border-[#BEDAF2] text-[#101d26]'

          const iconColor = isSuccess
            ? 'text-[#2E8B57]'
            : isError
            ? 'text-[#C2412D]'
            : isWarning
            ? 'text-[#B87E0C]'
            : 'text-[#005459]'

          const indicatorBar = isSuccess
            ? 'bg-[#2E8B57]'
            : isError
            ? 'bg-[#C2412D]'
            : isWarning
            ? 'bg-[#B87E0C]'
            : 'bg-[#005459]'

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-[8px] border shadow-lg overflow-hidden flex items-start p-3.5 gap-3 transition-all animate-in slide-in-from-bottom-2 ${bgClass}`}
            >
              <div className={`w-1 self-stretch rounded-full -my-1 -ml-1 ${indicatorBar}`} />
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-[13px] font-bold tracking-tight text-[#101d26] leading-snug">
                    {toast.title}
                  </h4>
                )}
                {toast.message && (
                  <p className="text-[12px] text-[#565f6b] mt-0.5 leading-relaxed font-normal">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action.onClick?.()
                      removeToast(toast.id)
                    }}
                    className="mt-2 text-[11px] font-semibold text-[#005459] hover:underline cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-[#8F9CA7] hover:text-[#101d26] p-0.5 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      showToast: () => {},
      removeToast: () => {},
    }
  }
  return ctx
}
