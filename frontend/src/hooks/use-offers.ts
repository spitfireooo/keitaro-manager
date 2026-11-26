import { useQuery } from '@tanstack/react-query'

import { offersService } from '../services/offers.service'
import { queryKeys } from './query-keys'

export function useOffers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.offers,
    queryFn: ({ signal }) => offersService.list(signal),
    enabled,
  })
}
