import type { DadataFioSuggestion, SelectedFio } from './types'

export function mapFioSuggestionToSelected(suggestion: DadataFioSuggestion): SelectedFio {
  const { data } = suggestion
  const fullName = suggestion.value.trim()

  return {
    fullName,
    surname: data.surname?.trim() || undefined,
    name: data.name?.trim() || undefined,
    patronymic: data.patronymic?.trim() || undefined,
  }
}
