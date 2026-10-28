import { useEffect, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useToast } from '../components/Toast'
import { Button, Confirm, Empty, ErrorNote, Field, Input, Modal, PageHeader, Pagination, Skeleton, Textarea, cx } from '../components/ui'

function ResourceForm({ fields, item, singular, onSave, onClose }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, item?.[f.name] ?? ''])))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]))
      await onSave(payload)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map((f, i) => (
        <Field key={f.name} label={f.label}>
          {f.textarea
            ? <Textarea value={values[f.name]} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} placeholder={f.placeholder} />
            : <Input type={f.type || 'text'} step={f.step} min={f.min} required={f.required} autoFocus={i === 0} placeholder={f.placeholder}
                value={values[f.name]} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />}
        </Field>
      ))}
      <ErrorNote>{error}</ErrorNote>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={busy}>{item ? 'Save changes' : `Add ${singular}`}</Button>
      </div>
    </form>
  )
}

export default function ResourcePage({ title, subtitle, resource, listKey, singular, fields, columns, grid, emptyIcon, emptyTitle, emptyText }) {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [dq, setDq] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // { item } | null
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => { setDq(q); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    let live = true
    setError('')
    api.list(resource, { search: dq, page, per_page: 12 }).then((d) => live && setData(d)).catch((e) => live && setError(e.message))
    return () => { live = false }
  }, [resource, dq, page, tick])

  const save = async (payload) => {
    if (modal.item) await api.update(resource, modal.item.id, payload)
    else await api.create(resource, payload)
    toast(modal.item ? `${singular[0].toUpperCase() + singular.slice(1)} saved` : `${singular[0].toUpperCase() + singular.slice(1)} added`)
    setModal(null)
    setTick((t) => t + 1)
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await api.remove(resource, toDelete.id)
      toast(`${singular[0].toUpperCase() + singular.slice(1)} deleted`)
      setTick((t) => t + 1)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const rows = data?.[listKey]

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={<Button variant="accent" icon={Plus} onClick={() => setModal({ item: null })}>Add {singular}</Button>} />
      <div className="relative mb-4 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="pl-9" aria-label={`Search ${title.toLowerCase()}`} />
      </div>
      <ErrorNote>{error}</ErrorNote>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {!data ? (
          <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : rows.length === 0 ? (
          <Empty icon={emptyIcon} title={dq ? 'Nothing matches' : emptyTitle} text={dq ? 'Try a different search.' : emptyText}
            action={!dq && <Button variant="accent" icon={Plus} onClick={() => setModal({ item: null })}>Add {singular}</Button>} />
        ) : (
          <ul className="divide-y divide-ink/10">
            {rows.map((row) => (
              <li key={row.id} className={cx('grid items-center gap-4 px-5 py-3.5', grid)}>
                {columns.map((c) => <div key={c.key} className={cx('min-w-0', c.hideOnMobile && 'hidden sm:block', c.className)}>{c.render(row)}</div>)}
                <div className="flex gap-1">
                  <button onClick={() => setModal({ item: row })} aria-label={`Edit ${row.name}`} className="rounded-lg p-2 text-muted transition hover:bg-ink/5 hover:text-ink"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setToDelete(row)} aria-label={`Delete ${row.name}`} className="rounded-lg p-2 text-muted transition hover:bg-coral/10 hover:text-coral"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Pagination meta={data?.pagination} onPage={setPage} />

      <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={modal?.item ? `Edit ${singular}` : `Add ${singular}`}>
        {modal && <ResourceForm key={modal.item?.id ?? 'new'} fields={fields} item={modal.item} singular={singular} onSave={save} onClose={() => setModal(null)} />}
      </Modal>
      <Confirm open={Boolean(toDelete)} onClose={() => setToDelete(null)} busy={deleting} title={`Delete ${singular}?`}
        message={`${toDelete?.name ?? 'This item'} will be removed permanently.`} confirmLabel="Delete" onConfirm={remove} />
    </>
  )
}
