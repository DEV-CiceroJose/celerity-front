import { currentServerTime } from '../utils/config'
import { useEffect, useState } from 'react'

export function useBrasiliaClock() {
  const [now, setNow] = useState(() => currentServerTime())
  useEffect(() => {
    const refresh = () => setNow(currentServerTime())
    const timer = window.setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return now
}
