import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const toast = useCallback((message, type = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setItems((i) => [...i, { id, message, type }])
    setTimeout(() => setItems((i) => i.filter((x) => x.id !== id)), 3800)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-24 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col gap-2 lg:bottom-6" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id} layout
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              className="flex items-center gap-2.5 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-lift"
            >
              {t.type === 'error'
                ? <AlertCircle className="h-4 w-4 shrink-0 text-coral" />
                : <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
