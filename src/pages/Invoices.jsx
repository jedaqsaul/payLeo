import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Plus, Search } from 'lucide-react'
import { api } from '../lib/api'
import { fdate, money } from '../lib/format'
import { Button, Empty, ErrorNote, Input, PageHeader, Pagination, Skeleton, StatusPill, cx } from '../components/ui'

const TABS = [['', 'All'], ['DRAFT', 'Draft'], ['SENT', 'Sent'], ['OVERDUE', 'Overdue'], ['PAID', 'Paid'], ['CANCELLED', 'Cancelled']]
const GRID = 'grid grid-cols-[1fr_auto] items-center gap-4 sm:grid-cols-[1fr_1.3fr_1fr_1fr_auto]'

export default function Invoices() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [dq, setDq] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => { setDq(q); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    let live = true
    setError('')
    api.list('invoices', { status, search: dq, page, per_page: 12 })
      .then((d) => live && setData(d))
      .catch((e) => live && setError(e.message))
    return () => { live = false }
  }, [status, dq, page])

  const filtered = status || dq

  return (
    <>
      <PageHeader title="Invoices" subtitle="Everything you have billed, in one place."
        actions={<Link to="/invoices/new"><Button variant="accent" icon={Plus}>New invoice</Button></Link>} />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-ink/5 p-1" role="tablist">
          {TABS.map(([v, label]) => (
            <button key={v} role="tab" aria-selected={status === v} onClick={() => { setStatus(v); setPage(1) }}
              className={cx('relative whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition', status === v ? 'text-ink' : 'text-muted hover:text-ink')}>
              {status === v && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={{ type: 'spring', damping: 30, stiffness: 400 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search number or customer" className="pl-9" aria-label="Search invoices" />
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {!data ? (
          <div className="space-y-3 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : data.invoices.length === 0 ? (
          <Empty icon={FileText}
            title={filtered ? 'No invoices match' : 'No invoices yet'}
            text={filtered ? 'Try a different status or search term.' : 'Create your first invoice and it will show up here.'}
            action={!filtered && <Link to="/invoices/new"><Button variant="accent" icon={Plus}>Create invoice</Button></Link>} />
        ) : (
          <>
            <div className={cx(GRID, 'hidden border-b border-ink/10 px-5 py-3 text-sm font-medium text-muted sm:grid')}>
              <span>Number</span><span>Customer</span><span>Due</span><span className="text-right">Total</span><span className="w-24 text-right">Status</span>
            </div>
            <ul className="divide-y divide-ink/10">
              {data.invoices.map((inv) => (
                <li key={inv.id}>
                  <button onClick={() => navigate(`/invoices/${inv.id}`)} className={cx(GRID, 'w-full px-5 py-4 text-left transition hover:bg-ink/[.03]')}>
                    <span>
                      <span className="block font-semibold">{inv.invoice_number}</span>
                      <span className="block truncate text-sm text-muted sm:hidden">{inv.customer_name}</span>
                    </span>
                    <span className="hidden truncate sm:block">{inv.customer_name}</span>
                    <span className="hidden text-muted sm:block">{fdate(inv.due_date)}</span>
                    <span className="hidden text-right font-semibold tabular-nums sm:block">{money(inv.total)}</span>
                    <span className="flex flex-col items-end gap-1 sm:w-24">
                      <span className="font-semibold tabular-nums sm:hidden">{money(inv.total)}</span>
                      <StatusPill status={inv.status} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <Pagination meta={data?.pagination} onPage={setPage} />
    </>
  )
}
