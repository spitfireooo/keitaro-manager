import { useController, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { toOfferOptions } from '../components/form/offer-options'

import { useApiErrorMessage } from './use-api-error-message'
import { useCreateCampaign } from './use-campaigns'
import { useOffers } from './use-offers'

interface CampaignFormValues {
  name: string
  countryCode: string
  offerId: string
}

export function useCampaignForm(onCreated: (campaignId: number) => void) {
  const { t } = useTranslation()
  const offers = useOffers()
  const creation = useCreateCampaign()
  const offersError = useApiErrorMessage(offers.error)
  const creationError = useApiErrorMessage(creation.error)

  const form = useForm<CampaignFormValues>({
    defaultValues: { name: '', countryCode: '', offerId: '' },
  })

  const fields = {
    name: form.register('name', {
      validate: (name) => Boolean(name.trim()) || t('createCampaign.nameRequired'),
    }),
    countryCode: form.register('countryCode', {
      validate: (code) => /^[a-z]{2}$/i.test(code.trim()) || t('createCampaign.countryInvalid'),
    }),
  }
  const activeOffers = offers.data?.filter((offer) => offer.state === 'active') ?? []
  const { field: offerField } = useController({
    name: 'offerId',
    control: form.control,
    rules: {
      validate: (id) => activeOffers.some((offer) => String(offer.id) === id) || t('createCampaign.offerRequired'),
    },
  })

  const submit = form.handleSubmit(({ name, countryCode, offerId }) => {
    creation.mutate(
      { name: name.trim(), country_code: countryCode.trim().toUpperCase(), offer_id: Number(offerId) },
      { onSuccess: (campaign) => onCreated(campaign.id) },
    )
  })

  return {
    fields,
    errors: form.formState.errors,
    submit,
    offerField,
    offerOptions: toOfferOptions(activeOffers),
    offersLoading: offers.isPending,
    offersError: offers.isError ? offersError : undefined,
    retryOffers: () => void offers.refetch(),
    creationPending: creation.isPending,
    creationError: creation.isError ? creationError : undefined,
  }
}
