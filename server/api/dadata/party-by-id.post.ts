const DADATA_FIND_PARTY_URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party'

const ACTIVE_PARTY_STATUS = 'ACTIVE'

interface DadataPartyByIdRequestBody {
  inn?: unknown
  kpp?: unknown
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

  const body = await readBody<DadataPartyByIdRequestBody>(event)
  const inn = typeof body?.inn === 'string' ? body.inn.trim() : ''

  if (!inn) {
    return { suggestions: [] }
  }

  const kpp = typeof body?.kpp === 'string' ? body.kpp.trim() : ''
  const query = kpp ? `${inn}/${kpp}` : inn

  try {
    const response = await $fetch<{ suggestions?: unknown[] }>(DADATA_FIND_PARTY_URL, {
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
        count: 1,
      },
    })

    const suggestions = Array.isArray(response.suggestions)
      ? response.suggestions.filter(isActivePartySuggestion)
      : []

    return { suggestions }
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'DaData findById party request failed',
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
