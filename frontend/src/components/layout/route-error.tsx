import { useTranslation } from 'react-i18next'

import { StatusPanel } from '../ui/status-panel'

export function RouteError() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <StatusPanel message={t('errors.pageFailed')} onRetry={() => window.location.reload()} />
    </main>
  )
}
