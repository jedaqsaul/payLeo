import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ban, CheckCheck, Download, Pencil, Send, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { fdate, money } from '../lib/format'
import { useToast } from '../components/Toast'
import { Button, Confirm, ErrorNote, Skeleton, StatusPill } from '../components/ui'

function Stamp({ status, animate }) {
  if (status !== 'PAID' && status !== 'CANCELLED') return null
  const paid = status === 'PAID'
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute right-6 top-40 rounded-lg border-[5px] px-5 py-1 font-display text-5xl font-extrabold tracking-widest sm:right-12 sm:text-6xl ${paid ? 'border-leaf text-leaf' : 'border-muted text-muted'}`}
      initial={animate ? { scale: 2.8, rotate: -24, opacity: 0 } : { scale: 1, rotate: -12, opacity: 0.85 }}
      animate={{ scale: 1, rotate: -12, opacity: 0.85 }}
      transition={{ type: 'spring', damping: 11, stiffness: 240 }}
    >
      {paid ? 'PAID' : 'CANCELLED'}
    </motion.div>
  )
}

function Paper({ inv, customer, seller, stampAnimate }) {
  return (
    <div className="drop-shadow-[0_20px_26px_rgba(14,42,36,.2)]">
      <article className="relative rounded-t-lg bg-paper p-6 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-xl font-bold">{seller.name}</p>
            <p className="text-sm text-muted">{seller.email}</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-extrabold tracking-tight">Invoice</h1>
            <p className="text-muted">{inv.invoice_number}</p>
          </div>
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-sm text-muted">Billed to</p>
            <p className="font-semibold">{customer?.name || inv.customer_name}</p>
            <div className="whitespace-pre-line text-sm text-ink/70">
              {[customer?.email, customer?.phone, customer?.address].filter(Boolean).join('\n')}
            </div>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            <dt className="text-muted">Issued</dt><dd className="text-right font-medium">{fdate(inv.issue_date)}</dd>
            <dt className="text-muted">Due</dt><dd className="text-right font-medium">{fdate(inv.due_date)}</dd>
            <dt className="text-muted">Status</dt><dd className="flex justify-end"><StatusPill status={inv.status} /></dd>
          </dl>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink text-muted">
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 text-right font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Unit price</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {inv.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-3 pr-3"><p className="font-semibold">{it.name}</p>{it.description && <p className="text-ink/60">{it.description}</p>}</td>
                  <td className="py-3 text-right tabular-nums">{Number(it.quantity)}</td>
                  <td className="py-3 text-right tabular-nums">{money(it.unit_price)}</td>
                  <td className="py-3 text-right font-semibold tabular-nums">{money(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="ml-auto mt-6 w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{money(inv.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd className="tabular-nums">{money(inv.tax)}</dd></div>
          <div className="flex items-baseline justify-between border-t-2 border-ink pt-3">
            <dt className="font-semibold">Total due</dt><dd className="font-display text-3xl font-bold tabular-nums">{money(inv.total)}</dd>
          </div>
        </dl>

        {inv.notes && <p className="mt-8 whitespace-pre-line border-t border-ink/10 pt-4 text-sm text-ink/70">{inv.notes}</p>}
        <Stamp status={inv.status} animate={stampAnimate} />
      </article>
      <div className="paper-edge" />
    </div>
  )
}

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [inv, setInv] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [justPaid, setJustPaid] = useState(false)

  useEffect(() => {
    api.get('invoices', id).then(async ({ invoice }) => {
      setInv(invoice)
      try { setCustomer((await api.get('customers', invoice.customer_id)).customer) } catch { /* customer card is optional */ }
    }).catch((e) => setError(e.message))
  }, [id])

  const run = async (name, fn, okMsg) => {
    setBusy(name)
    try {
      const res = await fn()
      if (res?.invoice) setInv(res.invoice)
      if (okMsg) toast(okMsg)
      return res
    } catch (e) {
      toast(e.message, 'error')
      return null
    } finally {
      setBusy('')
    }
  }

  const downloadPdf = () => run('pdf', async () => {
    const blob = await api.pdf(id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${inv.invoice_number}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  })

  const markPaid = async () => { if (await run('paid', () => api.markPaid(id), 'Marked as paid')) setJustPaid(true) }
  const remove = async () => {
    setBusy('delete')
    try { await api.remove('invoices', id); toast('Invoice deleted'); navigate('/invoices') }
    catch (e) { toast(e.message, 'error'); setConfirm(null) }
    finally { setBusy('') }
  }

  if (error) return <ErrorNote>{error}</ErrorNote>
  if (!inv) return <div className="grid gap-6 lg:grid-cols-[1fr_260px]"><Skeleton className="h-[560px]" /><Skeleton className="h-56" /></div>

  const open = ['DRAFT', 'SENT', 'OVERDUE'].includes(inv.status)

  return (
    <>
      <Link to="/invoices" className="mb-4 inline-block text-sm font-semibold text-leaf hover:underline">All invoices</Link>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_260px]">
        <Paper inv={inv} customer={customer} seller={user} stampAnimate={justPaid} />

        <aside className="space-y-2 lg:sticky lg:top-8">
          {inv.status === 'DRAFT' && <Button variant="primary" icon={Send} className="w-full" loading={busy === 'sent'} onClick={() => run('sent', () => api.setStatus(id, 'SENT'), 'Marked as sent')}>Mark as sent</Button>}
          {(inv.status === 'SENT' || inv.status === 'OVERDUE') && <Button variant="accent" icon={CheckCheck} className="w-full" loading={busy === 'paid'} onClick={markPaid}>Mark as paid</Button>}
          <Button variant="outline" icon={Download} className="w-full" loading={busy === 'pdf'} onClick={downloadPdf}>Download PDF</Button>
          {open && <Link to={`/invoices/${id}/edit`} className="block"><Button variant="outline" icon={Pencil} className="w-full">Edit invoice</Button></Link>}
          {open && <Button variant="ghost" icon={Ban} className="w-full" onClick={() => setConfirm('cancel')}>Cancel invoice</Button>}
          {inv.status !== 'PAID' && <Button variant="ghost" icon={Trash2} className="w-full text-coral hover:bg-coral/10" onClick={() => setConfirm('delete')}>Delete</Button>}
          {inv.paid_at && <p className="px-1 pt-2 text-sm text-muted">Paid on {fdate(inv.paid_at.slice(0, 10))}</p>}
        </aside>
      </div>

      <Confirm open={confirm === 'cancel'} onClose={() => setConfirm(null)} busy={busy === 'cancelled'} title="Cancel this invoice?"
        message="A cancelled invoice cannot be marked as paid or edited afterwards." confirmLabel="Cancel invoice"
        onConfirm={async () => { await run('cancelled', () => api.setStatus(id, 'CANCELLED'), 'Invoice cancelled'); setConfirm(null) }} />
      <Confirm open={confirm === 'delete'} onClose={() => setConfirm(null)} busy={busy === 'delete'} title="Delete this invoice?"
        message="This permanently removes the invoice and its line items." confirmLabel="Delete invoice" onConfirm={remove} />
    </>
  )
}
