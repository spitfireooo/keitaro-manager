import { useApiErrorMessage } from '../../../hooks/use-api-error-message'
import { useOffers } from '../../../hooks/use-offers'
import { useStreamEditor } from '../../../hooks/use-stream-editor'

export function useStreamEditorPanel(campaignId: number, streamId: number) {
  const editor = useStreamEditor(campaignId, streamId)
  const catalog = useOffers()
  const fetchError = useApiErrorMessage(editor.fetchError)
  const actionError = useApiErrorMessage(editor.actionError)
  const catalogError = useApiErrorMessage(catalog.error)

  const offers = editor.state?.draft_offers ?? editor.state?.published_offers ?? []
  const currentIds = new Set(offers.map((offer) => offer.offer_id))
  const archive = (editor.state?.removed_offers ?? []).filter((offer) => !currentIds.has(offer.offer_id))
  const archivedIds = new Set(archive.map((offer) => offer.offer_id))
  const availableOffers = (catalog.data ?? []).filter(
    (offer) => offer.state === 'active' && !currentIds.has(offer.id) && !archivedIds.has(offer.id),
  )

  return {
    ...editor,
    hasDraft: editor.state?.draft_offers != null,
    offers,
    archive,
    availableOffers,
    catalogLoading: catalog.isPending,
    catalogErrorMessage: catalog.error ? catalogError : undefined,
    retryCatalog: () => void catalog.refetch(),
    fetchErrorMessage: editor.fetchError ? fetchError : undefined,
    actionErrorMessage: editor.actionError ? actionError : undefined,
  }
}
