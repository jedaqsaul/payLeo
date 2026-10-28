const BASE = import.meta.env.VITE_API_URL || ''
const KEY = 'payleo_token'

export const tokenStore = {
  get: () => localStorage.getItem(KEY),
  set: (t) => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),
}

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request(path, { method = 'GET', body, params, blob } = {}) {
  const url = new URL(BASE + path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v != null) url.searchParams.set(k, v)
    })
  }
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError('Cannot reach the server. Check that the API is running.', 0)
  }

  // A rejected token on a protected call means the session is over.
  const isAuthCall = path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')
  if ((res.status === 401 || res.status === 422) && token && !isAuthCall) {
    onUnauthorized()
    throw new ApiError('Your session has expired. Sign in again.', res.status)
  }

  if (!res.ok) {
    let data = {}
    try { data = await res.json() } catch { /* non-JSON error body */ }
    throw new ApiError(data.error || 'Something went wrong. Try again.', res.status, data.details)
  }
  return blob ? res.blob() : res.json()
}

export const api = {
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  me: () => request('/api/auth/me'),
  summary: () => request('/api/dashboard/summary/'),
  list: (resource, params) => request(`/api/${resource}/`, { params }),
  get: (resource, id) => request(`/api/${resource}/${id}/`),
  create: (resource, body) => request(`/api/${resource}/`, { method: 'POST', body }),
  update: (resource, id, body) => request(`/api/${resource}/${id}/`, { method: 'PUT', body }),
  remove: (resource, id) => request(`/api/${resource}/${id}/`, { method: 'DELETE' }),
  setStatus: (id, status) => request(`/api/invoices/${id}/status/`, { method: 'POST', body: { status } }),
  markPaid: (id) => request(`/api/invoices/${id}/mark-paid/`, { method: 'POST' }),
  pdf: (id) => request(`/api/invoices/${id}/pdf/`, { blob: true }),
}
