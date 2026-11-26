import { Pin, PinOff, RotateCcw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { EditorOffer } from '../../services/streams.service'

interface EditorOfferTableProps {
  offers: EditorOffer[]
  offerNames: ReadonlyMap<number, string>
  label: string
  disabled: boolean
  onPin: (offerId: number, pinned: boolean) => void
  onRemove: (offerId: number) => void
  onRestore: (offerId: number) => void
}

export function EditorOfferTable({
  offers,
  offerNames,
  label,
  disabled,
  onPin,
  onRemove,
  onRestore,
}: EditorOfferTableProps) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-105 text-left text-sm">
        <caption className="sr-only">{label}</caption>
        <thead className="bg-subtle text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">{t('streams.offer')}</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">{t('streams.share')}</th>
            <th scope="col" className="px-3 py-2 font-medium">{t('editor.status')}</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">{t('editor.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {offers.map((offer) => {
            const id = offer.offer_id
            const name = offerNames.get(id)
            const removed = offer.state === 'removed'
            const active = offer.state === 'active'
            const status = removed ? t('editor.removed') : active ? t('editor.active') : t('editor.disabled')
            const pinLabel = offer.pinned ? t('editor.unpin', { id }) : t('editor.pin', { id })

            return (
              <tr key={id} className={removed ? 'bg-subtle text-muted' : undefined}>
                <td className="px-3 py-2">
                  {name && <span className="block font-medium">{name}</span>}
                  <span className="text-xs text-muted">#{id}</span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{offer.share}%</td>
                <td className="px-3 py-2">{status}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1.5">
                    {removed ? (
                      <button
                        type="button"
                        className="button-secondary whitespace-nowrap"
                        disabled={disabled}
                        aria-label={t('editor.restoreOffer', { id })}
                        onClick={() => onRestore(id)}
                      >
                        <RotateCcw aria-hidden="true" className="size-4" />
                        {t('editor.restore')}
                      </button>
                    ) : (
                      <>
                        {active && (
                          <button
                            type="button"
                            className={offer.pinned ? 'button-secondary text-accent' : 'button-secondary'}
                            disabled={disabled}
                            aria-label={pinLabel}
                            aria-pressed={offer.pinned}
                            title={pinLabel}
                            onClick={() => onPin(id, !offer.pinned)}
                          >
                            {offer.pinned ? <PinOff aria-hidden="true" className="size-4" /> : <Pin aria-hidden="true" className="size-4" />}
                          </button>
                        )}
                        <button
                          type="button"
                          className="button-secondary"
                          disabled={disabled}
                          aria-label={t('editor.remove', { id })}
                          title={t('editor.remove', { id })}
                          onClick={() => onRemove(id)}
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
