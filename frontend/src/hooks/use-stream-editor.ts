import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { streamsService, type CampaignStream, type EditorAction } from '../services/streams.service'
import { queryKeys } from './query-keys'

export function useStreamEditor(campaignId: number, streamId: number) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.streamEditor(campaignId, streamId)
  const writing = useIsMutating({ mutationKey: queryKey, exact: true }) > 0
  const editor = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const state = await streamsService.fetchEditor(campaignId, streamId, signal)

      if (!signal.aborted && state.draft_offers === null) {
        queryClient.setQueryData<CampaignStream[]>(queryKeys.streams(campaignId), (streams) =>
          streams?.map((stream) =>
            stream.id === streamId ? { ...stream, offers: state.published_offers } : stream,
          ),
        )
      }

      return state
    },
    enabled: !writing,
    staleTime: Infinity,
    retry: false,
    refetchOnMount: 'always',
    refetchOnReconnect: false,
  })

  function refreshStreamList() {
    return queryClient.invalidateQueries({ queryKey: queryKeys.streams(campaignId), exact: true })
  }

  const mutation = useMutation({
    mutationKey: queryKey,
    scope: { id: queryKey.join(':') },
    mutationFn: (action: EditorAction) => streamsService.edit(campaignId, streamId, action),
    onMutate: () => queryClient.cancelQueries({ queryKey, exact: true }),
    onSuccess: (state, action) => {
      queryClient.setQueryData(queryKey, state)
      if (action.type === 'publish') {
        return refreshStreamList()
      }
    },
  })

  async function fetchFromKeitaro() {
    mutation.reset()
    const result = await editor.refetch()
    if (result.isSuccess) {
      await refreshStreamList()
    }
  }

  return {
    state: editor.data,
    loading: editor.isPending,
    busy: editor.isFetching || mutation.isPending || writing,
    fetchError: editor.error,
    actionError: mutation.error,
    fetchFromKeitaro,
    edit: mutation.mutate,
  }
}
