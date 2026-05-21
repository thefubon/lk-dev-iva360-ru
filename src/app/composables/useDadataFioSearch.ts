import { watchDebounced } from '@vueuse/core'
import type {
  DadataFioSuggestResponse,
  DadataFioSuggestion,
} from '@/shared/lib/dadata/types'

const MIN_QUERY_LENGTH = 2

export function useDadataFioSearch() {
  const query = ref('')
  const suggestions = ref<DadataFioSuggestion[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let requestId = 0

  async function fetchSuggestions(searchQuery: string) {
    const trimmed = searchQuery.trim()

    if (trimmed.length < MIN_QUERY_LENGTH) {
      suggestions.value = []
      error.value = null
      loading.value = false
      return
    }

    const currentRequestId = ++requestId
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<DadataFioSuggestResponse>(
        '/api/dadata/fio',
        {
          method: 'POST',
          body: { query: trimmed },
        },
      )

      if (currentRequestId !== requestId) {
        return
      }

      suggestions.value = response.suggestions ?? []
    } catch {
      if (currentRequestId !== requestId) {
        return
      }

      suggestions.value = []
      error.value = 'Не удалось выполнить поиск по ФИО'
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  }

  watchDebounced(
    query,
    (value) => {
      fetchSuggestions(value)
    },
    { debounce: 300 },
  )

  function reset() {
    requestId += 1
    query.value = ''
    suggestions.value = []
    loading.value = false
    error.value = null
  }

  return {
    query,
    suggestions,
    loading,
    error,
    reset,
    fetchSuggestions,
  }
}
