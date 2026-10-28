import { forwardRef, useEffect, useRef } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react'
import { STATUS_LABEL, money } from '../lib/format'

export const cx = (...a) => a.filter(Boolean).join(' ')

export function Logo({ light = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <path d="M6 3h20v24l-3.33-2.5L19.33 27 16 24.5 12.67 27 9.33 24.5 6 27z" fill="#E3A91B" />
        <path d="M11 10h10M11 14.5h10M11 19h5" stroke="#0E2A24" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className={cx('font-display text-xl font-bold tracking-tight', light ? 'text-white' : 'text-ink')}>PayLeo</span>
    </span>
  )
}

const variants = {
  primary: 'bg-pine text-white hover:bg-ink',
  accent: 'bg-gold text-ink hover:bg-[#f0b82a]',
  outline: 'border border-ink/15 bg-white text-ink hover:bg-ink/5',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-coral text-white hover:bg-[#b83f34]',
  onDark: 'bg-white/10 text-white hover:bg-white/15',
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading, icon: Icon, className, children, disabled, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm',
        variants[variant], className)}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
})

export const inputCls =
  'w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted/70 transition focus:border-leaf focus:outline-none focus:ring-2 focus:ring-gold/60'

export const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} className={cx(inputCls, props.className)} />
})
export const Textarea = forwardRef(function Textarea(props, ref) {
  return <textarea ref={ref} rows={3} {...props} className={cx(inputCls, 'resize-y', props.className)} />
})
export const Select = forwardRef(function Select(props, ref) {
  return <select ref={ref} {...props} className={cx(inputCls, 'appearance-none bg-[length:16px] pr-9', props.className)} />
})

export function Field({ label, hint, children, className }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

const pillStyle = {
  DRAFT: 'bg-ink/10 text-ink/70',
  SENT: 'bg-sky/15 text-sky',
  PAID: 'bg-leaf/15 text-leaf',
  OVERDUE: 'bg-coral/15 text-coral',
  CANCELLED: 'bg-ink/5 text-muted',
}

export function StatusPill({ status }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', pillStyle[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

const avatarColors = ['#1F6B58', '#2F6FB3', '#B8860B', '#7A4E9C', '#CF4B3F', '#14463B']
export function Avatar({ name = '?', size = 36 }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'
  const color = avatarColors[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % avatarColors.length]
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className={cx('relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-lift sm:rounded-3xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-md')}
            initial={{ y: 40, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <h2 className="text-xl font-bold tracking-tight">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-ink/5 hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Confirm({ open, title, message, confirmLabel, onConfirm, onClose, busy, danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-[15px] text-ink/75">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Keep it</Button>
        <Button variant={danger ? 'danger' : 'primary'} loading={busy} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.pages <= 1) return null
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-muted">
      <span>Page {meta.page} of {meta.pages}, {meta.total} total</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" icon={ChevronLeft} disabled={!meta.has_prev} onClick={() => onPage(meta.page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={!meta.has_next} onClick={() => onPage(meta.page + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-mint text-leaf">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export const Skeleton = ({ className }) => <div className={cx('animate-pulse rounded-lg bg-ink/10', className)} />

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function ErrorNote({ children }) {
  if (!children) return null
  return <div role="alert" className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{children}</div>
}

export function CountUp({ value, format = money, duration = 1.1 }) {
  const ref = useRef(null)
  const prev = useRef(0)
  useEffect(() => {
    const to = Number(value) || 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      if (ref.current) ref.current.textContent = format(to)
      prev.current = to
      return undefined
    }
    const controls = animate(prev.current, to, {
      duration,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = format(v) },
      onComplete: () => { prev.current = to },
    })
    return () => controls.stop()
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref} className="tabular-nums">{format(0)}</span>
}
