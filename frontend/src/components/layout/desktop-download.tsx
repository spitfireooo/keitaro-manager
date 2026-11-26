import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ENV } from '../../config/env.config'

export function DesktopDownload() {
  const { t } = useTranslation()
  if (ENV.IS_DESKTOP) return null

  const className = 'button-secondary size-9 shrink-0 p-0'
  const icon = <Download aria-hidden="true" className="size-4" />

  if (!ENV.DESKTOP_DOWNLOAD_URL) {
    const label = t('app.desktopUnavailable')
    return <button type="button" disabled className={className} title={label} aria-label={label}>{icon}</button>
  }

  const label = t('app.downloadDesktop')
  return (
    <a href={ENV.DESKTOP_DOWNLOAD_URL} download className={className} title={label} aria-label={label}>
      {icon}
    </a>
  )
}
