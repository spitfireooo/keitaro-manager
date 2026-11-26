import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useApiErrorMessage } from '../../../hooks/use-api-error-message'
import { useOffers } from '../../../hooks/use-offers'
import { useStreams } from '../../../hooks/use-streams'

export function useCampaignPage() {
  const { campaignId: param } = useParams()
  const campaignId = /^\d+$/.test(param ?? '') ? Number(param) : Number.NaN
  const valid = Number.isSafeInteger(campaignId) && campaignId > 0
  const [selection, setSelection] = useState<{ campaignId: number; streamId: number } | null>(null)
  const selectedStreamId = selection?.campaignId === campaignId ? selection.streamId : null
  const streams = useStreams(campaignId)
  const catalog = useOffers(valid)
  const errorMessage = useApiErrorMessage(streams.error)
  const offerNames = new Map(catalog.data?.map((offer) => [offer.id, offer.name]))

  function toggleEditor(streamId: number) {
    setSelection((current) => (
      current?.campaignId === campaignId && current.streamId === streamId
        ? null
        : { campaignId, streamId }
    ))
  }

  return { campaignId, valid, streams, errorMessage, offerNames, selectedStreamId, toggleEditor }
}
