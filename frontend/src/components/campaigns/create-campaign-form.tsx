import { useTranslation } from 'react-i18next'

import { useCampaignForm } from '../../hooks/use-campaign-form'
import { SelectSearch } from '../form/select-search'

interface CreateCampaignFormProps {
  onCancel: () => void
  onCreated: (campaignId: number) => void
}

export function CreateCampaignForm({ onCancel, onCreated }: CreateCampaignFormProps) {
  const { t } = useTranslation()
  const form = useCampaignForm(onCreated)

  return (
    <form onSubmit={form.submit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="campaign-name" className="field-label">{t('createCampaign.name')}</label>
        <input
          id="campaign-name"
          className="field-control"
          aria-invalid={Boolean(form.errors.name)}
          aria-describedby={form.errors.name ? 'campaign-name-error' : undefined}
          {...form.fields.name}
        />
        {form.errors.name && <p id="campaign-name-error" className="field-error">{form.errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="country-code" className="field-label">{t('createCampaign.country')}</label>
        <input
          id="country-code"
          className="field-control uppercase"
          placeholder="GM"
          maxLength={2}
          aria-invalid={Boolean(form.errors.countryCode)}
          aria-describedby={form.errors.countryCode ? 'country-code-error' : undefined}
          {...form.fields.countryCode}
        />
        {form.errors.countryCode && <p id="country-code-error" className="field-error">{form.errors.countryCode.message}</p>}
      </div>
      <div>
        <label htmlFor="campaign-offer" className="field-label">{t('createCampaign.offer')}</label>
        <SelectSearch
          id="campaign-offer"
          menuPlacement="above"
          options={form.offerOptions}
          value={form.offerField.value}
          disabled={form.offerOptions.length === 0 || form.creationPending}
          invalid={Boolean(form.errors.offerId)}
          describedBy={form.errors.offerId ? 'campaign-offer-error' : undefined}
          inputRef={form.offerField.ref}
          onBlur={form.offerField.onBlur}
          onChange={form.offerField.onChange}
        />
        {form.errors.offerId && <p id="campaign-offer-error" className="field-error">{form.errors.offerId.message}</p>}
        {form.offersLoading && <p className="mt-1 text-sm text-muted" role="status">{t('createCampaign.loadingOffers')}</p>}
        {form.offersError && (
          <div className="mt-2 flex flex-wrap items-center gap-3" role="alert">
            <span className="text-sm text-danger">{form.offersError}</span>
            <button type="button" className="button-secondary" onClick={form.retryOffers}>{t('common.retry')}</button>
          </div>
        )}
        {!form.offersLoading && !form.offersError && form.offerOptions.length === 0 && (
          <p className="mt-1 text-sm text-muted">{t('createCampaign.emptyOffers')}</p>
        )}
      </div>
      {form.creationError && <p className="field-error" role="alert">{form.creationError}</p>}
      <div className="flex justify-end gap-2 pt-3">
        <button type="button" className="button-secondary" onClick={onCancel}>{t('common.cancel')}</button>
        <button type="submit" className="button-primary" disabled={form.creationPending || form.offerOptions.length === 0}>
          {form.creationPending ? t('createCampaign.submitting') : t('campaigns.create')}
        </button>
      </div>
    </form>
  )
}
