import { ArrowRight } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { useRouteAddress } from './hooks/use-route-address'

export function RouteAddress() {
  const { t } = useTranslation()
  const address = useRouteAddress()
  const id = useId()
  const errorId = id + '-error'

  return (
    <form onSubmit={address.submit} className="pb-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="shrink-0 text-sm text-muted">{t('app.address')}</label>
        <div className="flex min-w-44 flex-1 items-center gap-2">
          <input
            id={id}
            className="field-control h-9 min-w-0 flex-1 py-0 font-mono"
            value={address.value}
            onChange={(event) => address.change(event.currentTarget.value)}
            onKeyDown={address.resetOnEscape}
            aria-invalid={address.invalid}
            aria-describedby={address.invalid ? errorId : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" aria-label={t('app.openAddress')} title={t('app.openAddress')} className="button-secondary size-9 shrink-0 p-0">
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {address.invalid && <p id={errorId} className="field-error" role="alert">{t('app.invalidAddress')}</p>}
    </form>
  )
}
