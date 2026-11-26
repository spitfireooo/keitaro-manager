import { useController, useForm } from 'react-hook-form'

import type { Offer } from '../../../services/offers.service'
import { toOfferOptions } from '../../form/offer-options'

export function useAddOfferForm(offers: Offer[], onAdd: (offerId: number) => void) {
  const { control, handleSubmit } = useForm<{ offerId: string }>({
    defaultValues: { offerId: '' },
  })
  const { field } = useController({ control, name: 'offerId', rules: { required: true } })
  const canSubmit = offers.some((offer) => offer.id === Number(field.value))

  const submit = handleSubmit(({ offerId }) => {
    const id = Number(offerId)
    if (offers.some((offer) => offer.id === id)) onAdd(id)
  })

  return { options: toOfferOptions(offers), field, canSubmit, submit }
}
