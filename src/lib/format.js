const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD'

let fmt
try {
  fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY })
} catch {
  fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })
}

export const money = (v) => fmt.format(Number(v) || 0)

export const fdate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

export const isoDate = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export const addDays = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

export const STATUS_LABEL = { DRAFT: 'Draft', SENT: 'Sent', PAID: 'Paid', OVERDUE: 'Overdue', CANCELLED: 'Cancelled' }
