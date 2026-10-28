import { Users } from 'lucide-react'
import ResourcePage from './Resource'
import { Avatar } from '../components/ui'

export default function Customers() {
  return (
    <ResourcePage
      title="Customers" subtitle="The people and companies you bill."
      resource="customers" listKey="customers" singular="customer"
      emptyIcon={Users} emptyTitle="No customers yet" emptyText="Add the first person or company you invoice."
      grid="grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1fr_1.3fr_auto]"
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone' },
        { name: 'address', label: 'Address', textarea: true },
      ]}
      columns={[
        { key: 'name', render: (c) => (
          <div className="flex items-center gap-3"><Avatar name={c.name} /><div className="min-w-0"><p className="truncate font-semibold">{c.name}</p><p className="truncate text-sm text-muted">{c.email || 'No email'}</p></div></div>
        ) },
        { key: 'phone', hideOnMobile: true, render: (c) => <span className="text-ink/75">{c.phone || '-'}</span> },
        { key: 'address', hideOnMobile: true, render: (c) => <span className="line-clamp-2 text-sm text-ink/75">{c.address || '-'}</span> },
      ]}
    />
  )
}
