import { watchDebounced } from '@vueuse/core'
import type {
  DadataPartySuggestResponse,
  DadataPartySuggestion,
} from '@/shared/lib/dadata/types'

const MIN_QUERY_LENGTH = 2

export function useDadataPartySearch() {
  const query = ref('')
  const suggestions = ref<DadataPartySuggestion[]>([])
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
      const response = await $fetch<DadataPartySuggestResponse>(
        '/api/dadata/party',
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
      error.value = 'Не удалось выполнить поиск компаний'
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
