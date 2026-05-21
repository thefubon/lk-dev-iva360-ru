const DADATA_PARTY_URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party'

const ACTIVE_PARTY_STATUS = 'ACTIVE'

interface DadataPartyRequestBody {
  query?: unknown
  count?: unknown
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiKey = config.dadataApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'DaData API key is not configured',
    })
  }

  const body = await readBody<DadataPartyRequestBody>(event)
  const query = typeof body?.query === 'string' ? body.query.trim() : ''

  if (query.length < 2) {
    return { suggestions: [] }
  }

  const count =
    typeof body?.count === 'number' && body.count > 0 && body.count <= 20
      ? body.count
      : 10

  try {
    const response = await $fetch<{ suggestions?: unknown[] }>(DADATA_PARTY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${apiKey}`,
        ...(config.dadataSecretKey
          ? { 'X-Secret': config.dadataSecretKey }
          : {}),
      },
      body: {
        query,
        count,
        status: [ACTIVE_PARTY_STATUS],
      },
    })

    const suggestions = Array.isArray(response.suggestions)
      ? response.suggestions.filter(isActivePartySuggestion)
      : []

    return { suggestions }
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'DaData party suggest request failed',
    })
  }
})

function isActivePartySuggestion(suggestion: unknown): boolean {
  if (!suggestion || typeof suggestion !== 'object') {
    return false
  }

  const data = (suggestion as { data?: { state?: { status?: unknown } } }).data
  return data?.state?.status === ACTIVE_PARTY_STATUS
}
