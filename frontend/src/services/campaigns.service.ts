import { apiClient } from '../api/client'

export interface Campaign {
  id: number
  name: string
  alias: string
}

export interface CreateCampaignInput {
  name: string
  country_code: string
  offer_id: number
}

export interface CreatedCampaign extends Campaign {
  geo_stream_id: number
  offer_stream_id: number
}

export const campaignsService = {
  list(offset: number, limit: number, signal?: AbortSignal) {
    const query = new URLSearchParams({ offset: String(offset), limit: String(limit) })
    return apiClient.get<Campaign[]>('/campaigns?' + query, signal)
  },
  create(input: CreateCampaignInput) {
    return apiClient.post<CreatedCampaign>('/campaigns', input)
  },
}
