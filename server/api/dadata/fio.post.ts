const DADATA_FIO_URL =
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio'

interface DadataFioRequestBody {
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

  const body = await readBody<DadataFioRequestBody>(event)
  const query = typeof body?.query === 'string' ? body.query.trim() : ''

  if (query.length < 2) {
    return { suggestions: [] }
  }

  const count =
    typeof body?.count === 'number' && body.count > 0 && body.count <= 20
      ? body.count
      : 10

  try {
    const response = await $fetch<{ suggestions?: unknown[] }>(DADATA_FIO_URL, {
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
      },
    })

    const suggestions = Array.isArray(response.suggestions)
      ? response.suggestions
      : []

    return { suggestions }
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'DaData FIO suggest request failed',
    })
  }
})
