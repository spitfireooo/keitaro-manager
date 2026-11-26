import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '../../../config/routes.config'
import { useApiErrorMessage } from '../../../hooks/use-api-error-message'
import { useCampaigns } from '../../../hooks/use-campaigns'
import { useCampaignUiStore } from '../../../store/campaign-ui.store'

const pageSize = 25

export function useCampaignsPage() {
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)
  const campaigns = useCampaigns(offset, pageSize + 1)
  const errorMessage = useApiErrorMessage(campaigns.error)
  const createDialogOpen = useCampaignUiStore((state) => state.createDialogOpen)
  const openCreateDialog = useCampaignUiStore((state) => state.openCreateDialog)
  const closeCreateDialog = useCampaignUiStore((state) => state.closeCreateDialog)

  function handleCreated(campaignId: number) {
    closeCreateDialog()
    void navigate(ROUTES.campaign(campaignId))
  }

  return {
    campaigns,
    rows: campaigns.data?.slice(0, pageSize) ?? [],
    errorMessage,
    hasPrevious: offset > 0,
    hasNext: (campaigns.data?.length ?? 0) > pageSize,
    previousPage: () => setOffset((current) => Math.max(0, current - pageSize)),
    nextPage: () => setOffset((current) => current + pageSize),
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    handleCreated,
  }
}
