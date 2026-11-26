import { apiClient } from '../api/client'

export interface Offer {
  id: number
  name: string
  state: string
}

export const offersService = {
  list(signal?: AbortSignal) {
    return apiClient.get<Offer[]>('/offers', signal)
  },
}
