import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

const enableSentry = import.meta.env.VITE_ENABLE_SENTRY === 'true'

if (
  enableSentry &&
  import.meta.env.VITE_SENTRY_DSN &&
  process.env.NODE_ENV === 'production'
) {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
