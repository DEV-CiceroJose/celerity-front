const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('celerity:session-expired'))
    throw new Error('Sua sessão expirou.')
  }

  if (!response.ok) throw new Error('Não foi possível concluir a solicitação.')
  return response.status === 204 ? null : response.json()
}

export { API_URL }
