import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './app/App'
import { AppProviders } from './app/providers'
import { i18nReady } from './config/i18n.config'
import { initializeTheme } from './store/theme.store'
import './styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('Missing root element')

initializeTheme()

void i18nReady.then(() => {
  createRoot(container).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  )
})
