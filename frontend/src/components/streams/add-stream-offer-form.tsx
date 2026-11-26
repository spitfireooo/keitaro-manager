import { Plus } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { Offer } from '../../services/offers.service'
import { SelectSearch } from '../form/select-search'
import { useAddOfferForm } from './hooks/use-add-offer-form'

interface AddStreamOfferFormProps {
  offers: Offer[]
  disabled: boolean
  onAdd: (offerId: number) => void
}

export function AddStreamOfferForm({ offers, disabled, onAdd }: AddStreamOfferFormProps) {
  const { t } = useTranslation()
  const id = useId()
  const form = useAddOfferForm(offers, onAdd)

  return (
    <form onSubmit={form.submit} className="rounded-lg border border-line bg-subtle p-3">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-52 flex-1">
          <label htmlFor={id} className="field-label">{t('editor.searchOffer')}</label>
          <SelectSearch
            id={id}
            options={form.options}
            value={form.field.value}
            disabled={disabled}
            inputRef={form.field.ref}
            onBlur={form.field.onBlur}
            onChange={form.field.onChange}
          />
        </div>
        <button type="submit" className="button-primary h-9 sm:mt-6" disabled={disabled || !form.canSubmit}>
          <Plus aria-hidden="true" className="size-4" />
          {t('editor.add')}
        </button>
      </div>
    </form>
  )
}
