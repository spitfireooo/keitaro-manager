import { RefreshCw, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { StatusPanel } from '../ui/status-panel'
import { AddStreamOfferForm } from './add-stream-offer-form'
import { EditorOfferTable } from './editor-offer-table'
import { useStreamEditorPanel } from './hooks/use-stream-editor-panel'

interface StreamEditorProps {
  campaignId: number
  streamId: number
  offerNames: ReadonlyMap<number, string>
}

export function StreamEditor({ campaignId, streamId, offerNames }: StreamEditorProps) {
  const { t } = useTranslation()
  const editor = useStreamEditorPanel(campaignId, streamId)
  const offerActions = {
    onPin: (offerId: number, pinned: boolean) => editor.edit({ type: 'pin', offerId, pinned }),
    onRemove: (offerId: number) => editor.edit({ type: 'remove', offerId }),
    onRestore: (offerId: number) => editor.edit({ type: 'restore', offerId }),
  }

  return (
    <div id={'stream-editor-' + streamId} className="space-y-4 p-4" aria-busy={editor.busy}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {editor.state && (
          <span
            role="status"
            className={editor.hasDraft
              ? 'rounded-md bg-draft px-2 py-1 text-sm font-medium text-draft-content'
              : 'rounded-md bg-hover px-2 py-1 text-sm font-medium text-muted'}
          >
            {t(editor.hasDraft ? 'editor.draft' : 'editor.published')}
          </span>
        )}
        <button
          type="button"
          className="button-secondary ml-auto"
          disabled={editor.busy}
          onClick={() => void editor.fetchFromKeitaro()}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          {t('editor.fetch')}
        </button>
      </div>

      {editor.loading && <StatusPanel message={t('editor.loading')} />}
      {editor.fetchErrorMessage && <p role="alert" className="field-error">{editor.fetchErrorMessage}</p>}
      {editor.actionErrorMessage && <p role="alert" className="field-error">{editor.actionErrorMessage}</p>}

      {editor.state && (
        <>
          {editor.offers.length > 0 ? (
            <EditorOfferTable
              offers={editor.offers}
              offerNames={offerNames}
              label={t(editor.hasDraft ? 'editor.draft' : 'editor.published')}
              disabled={editor.busy}
              {...offerActions}
            />
          ) : <StatusPanel message={t('streams.emptyOffers')} />}

          {editor.catalogLoading && <StatusPanel message={t('createCampaign.loadingOffers')} />}
          {editor.catalogErrorMessage && (
            <StatusPanel message={editor.catalogErrorMessage} onRetry={editor.retryCatalog} />
          )}
          {editor.availableOffers.length > 0 ? (
            <AddStreamOfferForm
              offers={editor.availableOffers}
              disabled={editor.busy}
              onAdd={(offerId) => editor.edit({ type: 'add', offerId })}
            />
          ) : !editor.catalogLoading && !editor.catalogErrorMessage && (
            <p className="text-sm text-muted">{t('editor.noAvailableOffers')}</p>
          )}

          {editor.archive.length > 0 && (
            <section className="space-y-2" aria-label={t('editor.archive')}>
              <h3 className="text-sm font-semibold text-content">{t('editor.archive')}</h3>
              <EditorOfferTable
                offers={editor.archive}
                offerNames={offerNames}
                label={t('editor.archive')}
                disabled={editor.busy}
                {...offerActions}
              />
            </section>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-divider pt-3">
            <button
              type="button"
              className="button-secondary"
              disabled={editor.busy || !editor.hasDraft}
              onClick={() => editor.edit({ type: 'cancel' })}
            >
              {t('editor.cancel')}
            </button>
            <button
              type="button"
              className="button-primary"
              disabled={editor.busy || !editor.hasDraft}
              onClick={() => editor.edit({ type: 'publish' })}
            >
              <Upload aria-hidden="true" className="size-4" />
              {t('editor.publish')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
