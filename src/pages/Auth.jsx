import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { money } from '../lib/format'
import { Button, CountUp, ErrorNote, Field, Input, Logo } from '../components/ui'

const DEMO_LINES = [
  ['Brand identity refresh', '1', 2400],
  ['Landing page build', '1', 1800],
  ['Monthly support', '3', 150],
]
const DEMO_TOTAL = DEMO_LINES.reduce((s, [, q, p]) => s + Number(q) * p, 0)

// The login hero: an invoice writes itself, totals up, then gets stamped paid. Plays once.
function DemoInvoice() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStep(7); return undefined }
    const t = setInterval(() => setStep((s) => (s >= 7 ? s : s + 1)), 480)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative w-full max-w-md -rotate-2 drop-shadow-[0_24px_28px_rgba(0,0,0,.35)]">
      <div className="relative rounded-t-md bg-paper p-6 text-ink">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-lg font-bold">Northlight Design</p>
            <p className="text-xs text-muted">hello@northlight.studio</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold">Invoice</p>
            <p className="text-xs text-muted">INV-000042</p>
          </div>
        </div>
        <p className="mt-5 text-xs text-muted">Billed to</p>
        <p className="font-semibold">Brightpath Labs</p>

        <div className="mt-5 min-h-[104px] divide-y divide-ink/10 border-y border-ink/10 text-sm">
          {DEMO_LINES.map(([name, qty, price], i) => (
            <motion.div
              key={name} className="flex justify-between py-2.5"
              initial={{ opacity: 0, x: -8 }} animate={step > i ? { opacity: 1, x: 0 } : {}}
            >
              <span>{name}{Number(qty) > 1 && <span className="text-muted"> x{qty}</span>}</span>
              <span className="tabular-nums">{money(Number(qty) * price)}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-sm text-muted">Total due</span>
          <span className="font-display text-3xl font-bold tabular-nums">
            <CountUp value={step >= 4 ? DEMO_TOTAL : 0} duration={0.9} />
          </span>
        </div>

        <AnimatePresence>
          {step >= 6 && (
            <motion.div
              className="pointer-events-none absolute right-6 top-[46%] rounded-lg border-4 border-leaf px-4 py-1 font-display text-4xl font-extrabold tracking-widest text-leaf"
              initial={{ scale: 2.6, rotate: -22, opacity: 0 }}
              animate={{ scale: 1, rotate: -12, opacity: 0.9 }}
              transition={{ type: 'spring', damping: 11, stiffness: 260 }}
            >
              PAID
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="paper-edge" />
    </div>
  )
}

export default function Auth() {
  const { authenticate } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const isLogin = mode === 'login'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!isLogin && form.password.length < 8) { setError('Use a password with at least 8 characters.'); return }
    setBusy(true)
    try {
      await authenticate(mode, isLogin ? { email: form.email, password: form.password } : form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden flex-col justify-between bg-ink p-12 lg:flex">
        <Logo light />
        <div className="flex flex-col items-start gap-10">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white">Bill clients in minutes, not evenings.</h1>
            <p className="mt-4 text-lg text-white/65">Create an invoice, send a clean PDF, and see what is still owed at a glance.</p>
          </div>
          <DemoInvoice />
        </div>
        <p className="text-sm text-white/40">Built for freelancers and small businesses.</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="text-3xl font-bold tracking-tight">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mb-7 mt-1 text-muted">{isLogin ? 'Sign in to see what is owed.' : 'Start invoicing in under a minute.'}</p>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <Field label="Your name or business name">
                <Input value={form.name} onChange={set('name')} required autoComplete="name" autoFocus />
              </Field>
            )}
            <Field label="Email">
              <Input type="email" value={form.email} onChange={set('email')} required autoComplete="email" autoFocus={isLogin} />
            </Field>
            <Field label="Password" hint={isLogin ? undefined : 'At least 8 characters.'}>
              <Input type="password" value={form.password} onChange={set('password')} required autoComplete={isLogin ? 'current-password' : 'new-password'} />
            </Field>
            <ErrorNote>{error}</ErrorNote>
            <Button type="submit" variant="primary" loading={busy} className="w-full py-3">
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isLogin ? 'New to PayLeo?' : 'Already have an account?'}{' '}
            <button onClick={() => { setMode(isLogin ? 'register' : 'login'); setError('') }} className="font-semibold text-leaf underline-offset-4 hover:underline">
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </div>
  )
}
