import { useQuery } from '@tanstack/react-query'

import { streamsService } from '../services/streams.service'
import { queryKeys } from './query-keys'

export function useStreams(campaignId: number) {
  return useQuery({
    queryKey: queryKeys.streams(campaignId),
    queryFn: ({ signal }) => streamsService.list(campaignId, signal),
    enabled: Number.isSafeInteger(campaignId) && campaignId > 0,
  })
}
