import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CampaignStream } from '../../services/streams.service'
import { StreamEditor } from './stream-editor'

const streamTypeLabels = {
  default: 'streams.typeDefault',
  regular: 'streams.typeRegular',
  forced: 'streams.typeForced',
} as const

interface StreamListProps {
  campaignId: number
  streams: CampaignStream[]
  offerNames: ReadonlyMap<number, string>
  selectedStreamId: number | null
  onToggleEditor: (streamId: number) => void
}

export function StreamList({
  campaignId,
  streams,
  offerNames,
  selectedStreamId,
  onToggleEditor,
}: StreamListProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      {streams.map((stream) => (
        <section key={stream.id} className="rounded-xl border border-line bg-surface">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-divider px-4 py-3">
            <h2 className="font-semibold">{stream.name}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted">
                {Object.hasOwn(streamTypeLabels, stream.type)
                  ? t(streamTypeLabels[stream.type as keyof typeof streamTypeLabels])
                  : stream.type}
                {' · #'}{stream.id}
              </p>
              {stream.schema === 'landings' && (
                <button
                  type="button"
                  className="button-secondary"
                  aria-expanded={selectedStreamId === stream.id}
                  aria-controls={selectedStreamId === stream.id ? 'stream-editor-' + stream.id : undefined}
                  onClick={() => onToggleEditor(stream.id)}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  {t(selectedStreamId === stream.id ? 'editor.close' : 'editor.open')}
                </button>
              )}
            </div>
          </header>
          {selectedStreamId === stream.id && stream.schema === 'landings' ? (
            <StreamEditor campaignId={campaignId} streamId={stream.id} offerNames={offerNames} />
          ) : stream.offers.length === 0 ? (
            <p className="p-4 text-sm text-muted">{t('streams.emptyOffers')}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-subtle text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">{t('streams.offer')}</th>
                  <th scope="col" className="w-24 px-4 py-2 text-right font-medium">{t('streams.share')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {stream.offers.map((offer) => (
                  <tr key={offer.offer_id}>
                    <td className="px-4 py-3">
                      {offerNames.get(offer.offer_id) ?? '#' + offer.offer_id}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{offer.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  )
}
