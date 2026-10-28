import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, FilePlus2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { fdate, money } from '../lib/format'
import { Button, CountUp, Empty, ErrorNote, Skeleton, StatusPill } from '../components/ui'

function Row({ inv }) {
  return (
    <Link to={`/invoices/${inv.id}`} className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-ink/[.03]">
      <div className="min-w-0">
        <p className="truncate font-semibold">{inv.customer_name}</p>
        <p className="text-sm text-muted">{inv.invoice_number}, due {fdate(inv.due_date)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-semibold tabular-nums">{money(inv.total)}</span>
        <StatusPill status={inv.status} />
      </div>
    </Link>
  )
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.summary(),
      api.list('invoices', { per_page: 6 }),
      api.list('invoices', { status: 'OVERDUE', per_page: 5 }),
    ])
      .then(([s, r, o]) => setData({ s, recent: r.invoices, overdue: o.invoices }))
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorNote>{error}</ErrorNote>
  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-[28px]" />
        <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      </div>
    )
  }

  const { s, recent, overdue } = data
  if (s.total_invoices === 0) {
    return (
      <div className="rounded-3xl bg-white">
        <Empty
          icon={FilePlus2}
          title={`Welcome, ${user.name.split(' ')[0]}`}
          text="Add a customer, then create your first invoice. Totals, PDFs and payment tracking take care of themselves."
          action={<div className="flex gap-2"><Link to="/customers"><Button variant="outline">Add a customer</Button></Link><Link to="/invoices/new"><Button variant="accent">Create invoice</Button></Link></div>}
        />
      </div>
    )
  }

  const paid = Number(s.total_paid)
  const open = Number(s.total_outstanding)
  const base = paid + open || 1
  const lines = [
    ['Invoices', s.total_invoices],
    ['Paid', s.paid_invoices],
    ['Open', s.outstanding_invoices],
    ['Overdue', s.overdue_invoices],
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{greeting()}, {user.name.split(' ')[0]}</h1>

      <section className="grid gap-8 overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-10 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-white/60">Still to collect</p>
          <p className="mt-1 font-display text-5xl font-bold tracking-tight sm:text-7xl"><CountUp value={s.total_outstanding} /></p>
          <p className="mt-2 text-white/70">
            {s.outstanding_invoices} open {s.outstanding_invoices === 1 ? 'invoice' : 'invoices'}
            {s.overdue_invoices > 0 && <span className="text-[#ff9a8f]">, {s.overdue_invoices} overdue</span>}
          </p>

          <div className="mt-8 flex h-3 overflow-hidden rounded-full bg-white/10" role="img" aria-label="Paid versus outstanding">
            <motion.div className="bg-gold" initial={{ width: 0 }} animate={{ width: `${(paid / base) * 100}%` }} transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }} />
            <motion.div className="bg-white/35" initial={{ width: 0 }} animate={{ width: `${(open / base) * 100}%` }} transition={{ duration: 1, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gold" />Paid {money(paid)}</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-white/35" />Outstanding {money(open)}</span>
          </div>
        </div>

        <dl className="grid min-w-[200px] content-center divide-y divide-white/10 self-stretch">
          {lines.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-8 py-3">
              <dt className="text-white/60">{k}</dt>
              <dd className="font-display text-2xl font-bold tabular-nums">{v}</dd>
            </div>
          ))}
          <div className="pt-3 text-xs text-white/50">Invoiced in total: {money(s.total_invoiced)}</div>
        </dl>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xl font-bold">Needs attention</h2>
          <div className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
            {overdue.length === 0 ? (
              <p className="flex items-center gap-2 px-4 py-6 text-muted"><CheckCircle2 className="h-5 w-5 text-leaf" />Nothing is overdue.</p>
            ) : overdue.map((i) => <Row key={i.id} inv={i} />)}
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Recent invoices</h2>
            <Link to="/invoices" className="text-sm font-semibold text-leaf hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white">
            {recent.map((i) => <Row key={i.id} inv={i} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
