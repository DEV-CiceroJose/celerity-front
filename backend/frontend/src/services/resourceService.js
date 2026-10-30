import { apiRequest } from './api'

export function normalizeResource(item) {
  return { ...item.data, ...item }
}

export async function listResources(resource) {
  const data = await apiRequest(`/${resource}/`)
  return data.results.map(normalizeResource)
}

export async function loadResource(resource, id) {
  return normalizeResource(await apiRequest(`/${resource}/${id}/`))
}

export async function saveResource(resource, values, id) {
  const result = await apiRequest(id ? `/${resource}/${id}/` : `/${resource}/`, {
    method: id ? 'PATCH' : 'POST', body: JSON.stringify(values),
  })
  window.dispatchEvent(new Event('celerity:resources-changed'))
  return normalizeResource(result)
}

export async function removeResource(resource, id) {
  await apiRequest(`/${resource}/${id}/`, { method: 'DELETE' })
  window.dispatchEvent(new Event('celerity:resources-changed'))
}
