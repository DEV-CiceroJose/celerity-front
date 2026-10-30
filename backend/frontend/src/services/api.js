const API_URL = import.meta.env.VITE_API_URL || '/api'

function csrfToken() {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith('csrftoken='))
  return cookie ? decodeURIComponent(cookie.slice('csrftoken='.length)) : ''
}

export async function ensureCsrfToken() {
  await apiRequest('/csrf/')
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options, credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken(), ...options.headers },
  })
  if (response.status === 401 && !path.startsWith('/auth/login/')) {
    window.dispatchEvent(new CustomEvent('celerity:session-expired'))
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || 'Não foi possível concluir a solicitação.')
  }
  return response.status === 204 ? null : response.json()
}

export { API_URL }
