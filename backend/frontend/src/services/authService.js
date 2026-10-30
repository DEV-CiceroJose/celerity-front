const SESSION_KEY = 'celerity_session'
import { apiRequest, ensureCsrfToken } from './api'

export const authService = {
  getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  },
  async login({ email, password }) {
    await ensureCsrfToken()
    const { user: session } = await apiRequest('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  },
  async register(data) {
    await ensureCsrfToken()
    return apiRequest('/auth/register/', { method: 'POST', body: JSON.stringify(data) })
  },
  async logout() {
    await ensureCsrfToken()
    await apiRequest('/auth/logout/', { method: 'POST' })
    localStorage.removeItem(SESSION_KEY)
  },
}
