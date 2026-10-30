import { apiRequest } from './services/api'
import { setServerConfiguration } from './utils/config'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/global.css'

apiRequest('/config/', { signal: AbortSignal.timeout(5000) }).then(setServerConfiguration).catch(() => {}).finally(() => {
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary><App /></ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)

})
