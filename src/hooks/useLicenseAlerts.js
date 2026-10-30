import { createContext, createElement, useContext, useCallback, useEffect, useState } from 'react'
import { useBrasiliaClock } from './useBrasiliaClock'
import { brasiliaDate } from '../utils/dates'
import { setServerConfiguration } from '../utils/config'
import { apiRequest } from '../services/api'

const LicenseAlertsContext = createContext(null)

function useLicenseAlertsState() {
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const today = brasiliaDate(useBrasiliaClock())
  const refresh = useCallback(() => setVersion((value) => value + 1), [])
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    apiRequest('/notificacoes/', { signal: controller.signal }).then((data) => {
      if (active) { setServerConfiguration(data); setAlerts(data.results); setError('') }
    }).catch((reason) => { if (active) setError(reason.message) })
    return () => { active = false; controller.abort() }
  }, [today, version])
  useEffect(() => {
    const timer = window.setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    window.addEventListener('celerity:resources-changed', refresh)
    window.addEventListener('celerity:notifications-changed', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('celerity:resources-changed', refresh)
      window.removeEventListener('celerity:notifications-changed', refresh)
    }
  }, [refresh])
  const persist = async (next) => {
    const changed = next.filter((alert) => {
      const current = alerts.find((item) => item.id === alert.id)
      return !current || ['read', 'archived', 'snoozeUntil'].some((key) => current[key] !== alert[key])
    })
    try {
      await Promise.all(changed.map((alert) => apiRequest(`/notificacoes/${alert.id}/`, {
        method: 'PATCH', body: JSON.stringify({ read: alert.read, archived: Boolean(alert.archived), ...(alert.snoozeUntil ? { snoozeUntil: alert.snoozeUntil } : {}) }),
      })))
      window.dispatchEvent(new Event('celerity:notifications-changed'))
    } catch (reason) { setError(reason.message); throw reason }
  }
  return { alerts, persist, today, error, unread: alerts.filter((alert) => !alert.read).length }
}

export function LicenseAlertsProvider({ children }) {
  const state = useLicenseAlertsState()
  return createElement(LicenseAlertsContext.Provider, { value: state }, children)
}
export function useLicenseAlerts() {
  const state = useContext(LicenseAlertsContext)
  if (!state) throw new Error('Central de alertas indisponível.')
  return state
}
