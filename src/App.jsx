import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Layout from './components/Layout'
import { Logo } from './components/ui'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import InvoiceForm from './pages/InvoiceForm'
import InvoiceDetail from './pages/InvoiceDetail'
import Customers from './pages/Customers'
import Products from './pages/Products'

function Splash() {
  return <div className="flex min-h-screen items-center justify-center bg-ink"><Logo light /></div>
}

function Protected({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <Splash />
  return user ? children : <Navigate to="/login" replace />
}

function PublicOnly({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <Splash />
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Auth /></PublicOnly>} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
