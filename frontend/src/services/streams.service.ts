import { apiClient } from '../api/client'

export interface StreamOffer {
  offer_id: number
  share: number
  state: string
}

export interface CampaignStream {
  id: number
  campaign_id: number
  name: string
  type: string
  schema: string
  position: number
  offers: StreamOffer[]
}

export interface EditorOffer extends StreamOffer {
  pinned: boolean
}

export interface EditorState {
  published_offers: EditorOffer[]
  draft_offers: EditorOffer[] | null
  removed_offers: EditorOffer[]
}

export type EditorAction =
  | { type: 'add' | 'remove' | 'restore'; offerId: number }
  | { type: 'pin'; offerId: number; pinned: boolean }
  | { type: 'cancel' | 'publish' }

function campaignStreamsPath(campaignId: number) {
  return '/campaigns/' + campaignId + '/streams'
}

function streamPath(campaignId: number, streamId: number) {
  return campaignStreamsPath(campaignId) + '/' + streamId
}

export const streamsService = {
  list(campaignId: number, signal?: AbortSignal) {
    return apiClient.get<CampaignStream[]>(campaignStreamsPath(campaignId), signal)
  },
  fetchEditor(campaignId: number, streamId: number, signal?: AbortSignal) {
    return apiClient.post<EditorState>(streamPath(campaignId, streamId) + '/fetch', undefined, signal)
  },
  edit(campaignId: number, streamId: number, action: EditorAction) {
    const base = streamPath(campaignId, streamId)
    switch (action.type) {
      case 'add':
        return apiClient.post<EditorState>(base + '/offers', { offer_id: action.offerId })
      case 'remove':
        return apiClient.delete<EditorState>(base + '/offers/' + action.offerId)
      case 'restore':
        return apiClient.post<EditorState>(base + '/offers/' + action.offerId + '/restore')
      case 'pin':
        return apiClient.patch<EditorState>(base + '/offers/' + action.offerId + '/pin', {
          pinned: action.pinned,
        })
      case 'cancel':
        return apiClient.delete<EditorState>(base + '/draft')
      case 'publish':
        return apiClient.post<EditorState>(base + '/publish')
    }
  },
}
