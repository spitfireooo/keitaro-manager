import { useTranslation } from 'react-i18next'

interface StatusPanelProps {
  message: string
  onRetry?: () => void
}

export function StatusPanel({ message, onRetry }: StatusPanelProps) {
  const { t } = useTranslation()

  return (
    <div
      role={onRetry ? 'alert' : 'status'}
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 text-sm text-muted"
    >
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button-secondary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}
