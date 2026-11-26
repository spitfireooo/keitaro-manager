import { useTranslation } from 'react-i18next'

import { ApiError } from '../api/client'

const keysByCode = {
  keitaro_not_configured: 'errors.keitaroNotConfigured',
  keitaro_request_failed: 'errors.keitaroRequestFailed',
  campaign_not_found: 'errors.campaignNotFound',
  invalid_campaign: 'errors.invalidCampaign',
  campaign_creation_unconfirmed: 'errors.creationUnconfirmed',
  stream_not_found: 'errors.streamNotFound',
  stream_not_editable: 'errors.streamNotEditable',
  editor_state_not_found: 'errors.editorStateNotFound',
  offer_not_in_stream: 'errors.offerNotInStream',
  offer_unavailable: 'errors.offerUnavailable',
  offer_already_added: 'errors.offerAlreadyAdded',
  offer_not_removed: 'errors.offerNotRemoved',
  offer_not_active: 'errors.offerNotActive',
  invalid_share_distribution: 'errors.invalidShareDistribution',
  stream_changed_in_keitaro: 'errors.streamChanged',
  publish_unconfirmed: 'errors.publishUnconfirmed',
} as const

export function useApiErrorMessage(error: unknown) {
  const { t } = useTranslation()

  if (error instanceof ApiError && error.code && Object.hasOwn(keysByCode, error.code)) {
    return t(keysByCode[error.code as keyof typeof keysByCode])
  }

  return t('errors.requestFailed')
}
