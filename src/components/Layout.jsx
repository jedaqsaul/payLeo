import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, LayoutGrid, LogOut, Package, Plus, Users } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { Avatar, Logo, cx } from './ui'

const nav = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink p-5 lg:flex">
        <div className="px-2 pb-6 pt-1"><Logo light /></div>
        <NavLink
          to="/invoices/new"
          className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-sm font-bold text-ink transition hover:bg-[#f0b82a] active:scale-[.98]"
        >
          <Plus className="h-4 w-4" /> New invoice
        </NavLink>
        <nav className="flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="relative rounded-lg px-3 py-2.5 text-sm font-medium">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-white/10" transition={{ type: 'spring', damping: 30, stiffness: 400 }} />
                  )}
                  <span className={cx('relative flex items-center gap-3', isActive ? 'text-white' : 'text-white/60 hover:text-white')}>
                    <Icon className={cx('h-[18px] w-[18px]', isActive && 'text-gold')} /> {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <Avatar name={user?.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="truncate text-xs text-white/50">{user?.email}</p>
          </div>
          <button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Logo light />
        <div className="flex items-center gap-2">
          <NavLink to="/invoices/new" className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-sm font-bold text-ink">
            <Plus className="h-4 w-4" /> New
          </NavLink>
          <button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-white/70 hover:bg-white/10">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/10 bg-ink pb-[env(safe-area-inset-bottom)] lg:hidden">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cx('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium', isActive ? 'text-gold' : 'text-white/60')}>
            <Icon className="h-5 w-5" /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
