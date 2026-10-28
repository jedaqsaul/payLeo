import { Package } from 'lucide-react'
import ResourcePage from './Resource'
import { money } from '../lib/format'

export default function Products() {
  return (
    <ResourcePage
      title="Products" subtitle="Reusable products and services you can drop into any invoice."
      resource="products" listKey="products" singular="product"
      emptyIcon={Package} emptyTitle="No products yet" emptyText="Save what you sell once, then add it to invoices in one click."
      grid="grid-cols-[1fr_auto_auto] sm:grid-cols-[1.6fr_1fr_auto]"
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'description', label: 'Description', textarea: true },
        { name: 'unit_price', label: 'Unit price', type: 'number', step: '0.01', min: '0', required: true },
      ]}
      columns={[
        { key: 'name', render: (p) => <div><p className="truncate font-semibold">{p.name}</p><p className="truncate text-sm text-muted">{p.description || 'No description'}</p></div> },
        { key: 'price', className: 'sm:text-left text-right', render: (p) => <span className="font-semibold tabular-nums">{money(p.unit_price)}</span> },
      ]}
    />
  )
}
