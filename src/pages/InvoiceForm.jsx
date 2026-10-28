import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { addDays, isoDate, money } from '../lib/format'
import { useToast } from '../components/Toast'
import { Button, ErrorNote, Field, Input, PageHeader, Select, Skeleton, Textarea } from '../components/ui'

let seq = 0
const blank = () => ({ key: ++seq, name: '', description: '', quantity: '1', unit_price: '' })
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0 }
const lineTotal = (it) => Math.round(num(it.quantity) * num(it.unit_price) * 100) / 100

export default function InvoiceForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [customers, setCustomers] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(editing)
  const [locked, setLocked] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [issue, setIssue] = useState(isoDate())
  const [due, setDue] = useState(addDays(14))
  const [tax, setTax] = useState('0')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([blank()])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.list('customers', { per_page: 100 }).then((d) => setCustomers(d.customers)).catch((e) => setError(e.message))
    api.list('products', { per_page: 100 }).then((d) => setProducts(d.products)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!editing) return
    api.get('invoices', id).then(({ invoice: inv }) => {
      if (['PAID', 'CANCELLED'].includes(inv.status)) setLocked(true)
      setCustomerId(String(inv.customer_id))
      setIssue(inv.issue_date)
      setDue(inv.due_date)
      setTax(String(num(inv.tax)))
      setNotes(inv.notes || '')
      setItems(inv.items.map((i) => ({ key: ++seq, name: i.name, description: i.description || '', quantity: String(num(i.quantity)), unit_price: String(num(i.unit_price)) })))
    }).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [editing, id])

  const subtotal = useMemo(() => items.reduce((s, it) => s + lineTotal(it), 0), [items])
  const total = subtotal + num(tax)

  const patch = (key, field, value) => setItems((arr) => arr.map((it) => (it.key === key ? { ...it, [field]: value } : it)))
  const addProduct = (e) => {
    const p = products.find((x) => String(x.id) === e.target.value)
    if (!p) return
    setItems((arr) => {
      const rest = arr.length === 1 && !arr[0].name && !arr[0].unit_price ? [] : arr
      return [...rest, { key: ++seq, name: p.name, description: p.description || '', quantity: '1', unit_price: String(num(p.unit_price)) }]
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!customerId) return setError('Choose a customer for this invoice.')
    if (due < issue) return setError('The due date cannot be earlier than the issue date.')
    if (items.some((it) => !it.name.trim())) return setError('Give every line item a name.')
    if (items.some((it) => num(it.quantity) <= 0)) return setError('Quantities must be greater than zero.')
    if (items.some((it) => it.unit_price === '' || num(it.unit_price) < 0)) return setError('Enter a price of zero or more for every line item.')
    if (num(tax) < 0) return setError('Tax cannot be negative.')

    const payload = {
      customer_id: Number(customerId), issue_date: issue, due_date: due, tax: String(num(tax)), notes: notes.trim() || null,
      items: items.map((it) => ({ name: it.name.trim(), description: it.description.trim() || null, quantity: String(num(it.quantity)), unit_price: String(num(it.unit_price)) })),
    }
    setBusy(true)
    try {
      const { invoice } = editing ? await api.update('invoices', id, payload) : await api.create('invoices', payload)
      toast(editing ? 'Invoice saved' : `${invoice.invoice_number} created`)
      navigate(`/invoices/${invoice.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading || (customers === null && !error)) return <div className="space-y-4"><Skeleton className="h-10 w-56" /><Skeleton className="h-72" /></div>
  if (locked) {
    return <ErrorNote>This invoice is closed and can no longer be edited. <Link to={`/invoices/${id}`} className="font-semibold underline">Back to invoice</Link></ErrorNote>
  }

  return (
    <form onSubmit={submit}>
      <PageHeader title={editing ? 'Edit invoice' : 'New invoice'} subtitle="Totals are confirmed by the server when you save." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="grid gap-4 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-3 sm:p-6">
            <Field label="Customer" className="sm:col-span-3">
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">Choose a customer</option>
                {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              {customers?.length === 0 && <span className="mt-1.5 block text-sm text-muted">No customers yet. <Link to="/customers" className="font-semibold text-leaf underline">Add one first</Link>.</span>}
            </Field>
            <Field label="Issue date"><Input type="date" value={issue} onChange={(e) => setIssue(e.target.value)} required /></Field>
            <Field label="Due date"><Input type="date" value={due} min={issue} onChange={(e) => setDue(e.target.value)} required /></Field>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Line items</h2>
              {products.length > 0 && (
                <Select value="" onChange={addProduct} aria-label="Add from products" className="!w-auto text-sm">
                  <option value="">Add from products</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}, {money(p.unit_price)}</option>)}
                </Select>
              )}
            </div>
            <AnimatePresence initial={false}>
              {items.map((it, idx) => (
                <motion.div key={it.key} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="grid grid-cols-[1fr_88px_110px_auto] items-start gap-2 border-t border-ink/10 py-3 first:border-t-0 first:pt-0">
                    <div className="col-span-4 space-y-2 sm:col-span-1">
                      <Input value={it.name} onChange={(e) => patch(it.key, 'name', e.target.value)} placeholder="Item or service" aria-label={`Item ${idx + 1} name`} />
                      <Input value={it.description} onChange={(e) => patch(it.key, 'description', e.target.value)} placeholder="Description (optional)" aria-label={`Item ${idx + 1} description`} className="!py-2 text-sm" />
                    </div>
                    <Input type="number" min="0" step="0.01" value={it.quantity} onChange={(e) => patch(it.key, 'quantity', e.target.value)} aria-label={`Item ${idx + 1} quantity`} />
                    <Input type="number" min="0" step="0.01" value={it.unit_price} onChange={(e) => patch(it.key, 'unit_price', e.target.value)} placeholder="Price" aria-label={`Item ${idx + 1} unit price`} />
                    <div className="flex items-center gap-1 pt-2">
                      <span className="w-24 text-right font-semibold tabular-nums">{money(lineTotal(it))}</span>
                      <button type="button" disabled={items.length === 1} onClick={() => setItems((a) => a.filter((x) => x.key !== it.key))} aria-label={`Remove item ${idx + 1}`}
                        className="rounded-lg p-1.5 text-muted transition hover:bg-coral/10 hover:text-coral disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button variant="outline" size="sm" icon={Plus} className="mt-2" onClick={() => setItems((a) => [...a, blank()])}>Add line</Button>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white p-5 sm:p-6">
            <Field label="Notes" hint="Shown at the bottom of the invoice and PDF. Payment details work well here.">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thanks for your business." />
            </Field>
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <dl className="space-y-3">
              <div className="flex justify-between"><dt className="text-white/65">Subtotal</dt><dd className="font-semibold tabular-nums">{money(subtotal)}</dd></div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/65">Tax amount</dt>
                <dd><Input type="number" min="0" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} aria-label="Tax amount" className="!w-28 !border-white/20 !bg-white/10 !py-1.5 text-right !text-white" /></dd>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                {[0, 5, 10, 15].map((p) => (
                  <button type="button" key={p} onClick={() => setTax(String(Math.round(subtotal * p) / 100))} className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20">{p}%</button>
                ))}
              </div>
            </dl>
            <div className="mt-5 border-t border-white/15 pt-4">
              <p className="text-sm text-white/65">Total due</p>
              <p className="font-display text-4xl font-bold tabular-nums">{money(total)}</p>
            </div>
            <ErrorNote>{error}</ErrorNote>
            <Button type="submit" variant="accent" loading={busy} className="mt-5 w-full py-3">{editing ? 'Save changes' : 'Save as draft'}</Button>
            <Link to={editing ? `/invoices/${id}` : '/invoices'} className="mt-2 block text-center text-sm text-white/60 hover:text-white">Cancel</Link>
          </div>
        </aside>
      </div>
    </form>
  )
}
