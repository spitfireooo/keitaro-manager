import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { StreamList } from '../../components/streams/stream-list'
import { StatusPanel } from '../../components/ui/status-panel'
import { ROUTES } from '../../config/routes.config'
import { useCampaignPage } from './hooks/use-campaign-page'

export function CampaignPage() {
  const { t } = useTranslation()
  const { campaignId, valid, streams, errorMessage, offerNames, selectedStreamId, toggleEditor } =
    useCampaignPage()

  return (
    <>
      <Link
        to={ROUTES.campaigns}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t('streams.back')}
      </Link>
      {!valid ? (
        <StatusPanel message={t('streams.invalidCampaign')} />
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('streams.heading', { id: campaignId })}
          </h1>
          {streams.isPending && <StatusPanel message={t('streams.loading')} />}
          {streams.isError && (
            <StatusPanel message={errorMessage} onRetry={() => void streams.refetch()} />
          )}
          {streams.isSuccess && streams.data.length === 0 && <StatusPanel message={t('streams.empty')} />}
          {streams.data && streams.data.length > 0 && (
            <StreamList
              campaignId={campaignId}
              streams={streams.data}
              offerNames={offerNames}
              selectedStreamId={selectedStreamId}
              onToggleEditor={toggleEditor}
            />
          )}
        </>
      )}
    </>
  )
}
