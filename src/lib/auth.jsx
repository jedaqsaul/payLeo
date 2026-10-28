import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from './api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  useEffect(() => { setUnauthorizedHandler(logout) }, [logout])

  useEffect(() => {
    if (!tokenStore.get()) { setReady(true); return }
    api.me()
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true))
  }, [])

  const authenticate = useCallback(async (mode, payload) => {
    const d = await (mode === 'login' ? api.login(payload) : api.register(payload))
    tokenStore.set(d.access_token)
    setUser(d.user)
  }, [])

  const value = useMemo(() => ({ user, ready, authenticate, logout }), [user, ready, authenticate, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
