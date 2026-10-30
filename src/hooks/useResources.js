import { useCallback, useEffect, useMemo, useState } from 'react'
import { useBrasiliaClock } from './useBrasiliaClock'
import { brasiliaDate } from '../utils/dates'
import { presentRow } from '../utils/resources'
import { listResources } from '../services/resourceService'

export function useResources(resource) {
  const [rawRows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const today = brasiliaDate(useBrasiliaClock())
  const refresh = useCallback(() => setVersion((value) => value + 1), [])
  useEffect(() => {
    let active = true
    setLoading(true)
    listResources(resource).then((rows) => { if (active) { setRows(rows); setError('') } })
      .catch((reason) => { if (active) setError(reason.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [resource, version])
  useEffect(() => {
    const timer = window.setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    window.addEventListener('celerity:resources-changed', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('celerity:resources-changed', refresh)
    }
  }, [refresh])
  const rows = useMemo(() => rawRows.map((row) => presentRow(resource, row, today)), [rawRows, resource, today])
  return { rows, setRows, today, loading, error, refresh }
}
