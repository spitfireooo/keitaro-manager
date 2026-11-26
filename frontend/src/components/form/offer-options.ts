import type { Offer } from '../../services/offers.service'
import type { SearchOption } from './hooks/use-select-search'

export function toOfferOptions(offers: readonly Offer[]): SearchOption[] {
  return offers.map((offer) => ({
    value: String(offer.id),
    label: offer.name,
    detail: '#' + offer.id,
  }))
}
