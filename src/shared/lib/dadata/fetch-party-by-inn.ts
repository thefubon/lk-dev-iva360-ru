import { mapPartySuggestionToCompany } from './map-party-suggestion'
import type { DadataPartySuggestResponse, SelectedCompany } from './types'

export async function fetchPartyByInn(
  inn: string,
  kpp?: string,
): Promise<SelectedCompany | null> {
  const trimmedInn = inn.trim()
  if (!trimmedInn) {
    return null
  }

  const response = await $fetch<DadataPartySuggestResponse>('/api/dadata/party-by-id', {
    method: 'POST',
    body: {
      inn: trimmedInn,
      ...(kpp?.trim() ? { kpp: kpp.trim() } : {}),
    },
  })

  const suggestion = response.suggestions?.[0]
  if (!suggestion) {
    return null
  }

  return mapPartySuggestionToCompany(suggestion)
}
