export const queryKeys = {
  campaigns: {
    lists: ['campaigns', 'list'] as const,
    list: (offset: number, limit: number) => ['campaigns', 'list', offset, limit] as const,
  },
  streams: (campaignId: number) => ['campaigns', campaignId, 'streams'] as const,
  streamEditor: (campaignId: number, streamId: number) =>
    ['stream-editor', campaignId, streamId] as const,
  offers: ['offers'] as const,
}
