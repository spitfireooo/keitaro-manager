import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'

export function App() {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage === 'en' ? 'en' : 'ru'

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return <RouterProvider router={router} />
}
