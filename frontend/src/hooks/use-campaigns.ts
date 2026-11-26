import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { campaignsService } from '../services/campaigns.service'
import { queryKeys } from './query-keys'

export function useCampaigns(offset: number, limit: number) {
  return useQuery({
    queryKey: queryKeys.campaigns.list(offset, limit),
    queryFn: ({ signal }) => campaignsService.list(offset, limit, signal),
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: campaignsService.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists })
    },
  })
}
