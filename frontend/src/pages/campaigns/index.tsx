import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CampaignList } from '../../components/campaigns/campaign-list'
import { CreateCampaignDialog } from '../../components/campaigns/create-campaign-dialog'
import { StatusPanel } from '../../components/ui/status-panel'
import { useCampaignsPage } from './hooks/use-campaigns-page'

export function CampaignsPage() {
  const { t } = useTranslation()
  const {
    campaigns,
    rows,
    errorMessage,
    hasPrevious,
    hasNext,
    previousPage,
    nextPage,
    createDialogOpen,
    openCreateDialog,
    closeCreateDialog,
    handleCreated,
  } = useCampaignsPage()

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('campaigns.heading')}
        </h1>
        <button type="button" className="button-primary" onClick={openCreateDialog}>
          <Plus aria-hidden="true" className="size-4" />
          {t('campaigns.create')}
        </button>
      </div>

      {campaigns.isPending && <StatusPanel message={t('campaigns.loading')} />}
      {campaigns.isError && (
        <StatusPanel message={errorMessage} onRetry={() => void campaigns.refetch()} />
      )}
      {campaigns.isSuccess && rows.length === 0 && (
        <StatusPanel message={t('campaigns.empty')} />
      )}
      {rows.length > 0 && <CampaignList campaigns={rows} />}

      {(hasPrevious || hasNext) && (
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="button-secondary" disabled={!hasPrevious} onClick={previousPage}>
            {t('common.previous')}
          </button>
          <button type="button" className="button-secondary" disabled={!hasNext} onClick={nextPage}>
            {t('common.next')}
          </button>
        </div>
      )}

      {createDialogOpen && (
        <CreateCampaignDialog onClose={closeCreateDialog} onCreated={handleCreated} />
      )}
    </>
  )
}
