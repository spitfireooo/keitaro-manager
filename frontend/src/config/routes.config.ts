export const ROUTES = {
  campaigns: '/campaigns',
  campaignPattern: '/campaigns/:campaignId',
  campaign: (campaignId: number) => '/campaigns/' + campaignId,
} as const
