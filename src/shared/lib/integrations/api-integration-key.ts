export const API_INTEGRATION_KEY_STORAGE_KEY = 'iva360:admin:api-integration-key'

export const DEFAULT_MASKED_API_KEY = 'iva360_sk_live_••••••••••••••••••••'

const API_KEY_PREFIX = 'iva360_sk_live_'
const API_KEY_SECRET_LENGTH = 32
const API_KEY_PATTERN = /^iva360_sk_live_[a-zA-Z0-9]{32}$/
const API_KEY_CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateApiIntegrationKey(): string {
  const bytes = new Uint8Array(API_KEY_SECRET_LENGTH)
  crypto.getRandomValues(bytes)

  let secret = ''
  for (let i = 0; i < API_KEY_SECRET_LENGTH; i++) {
    secret += API_KEY_CHARSET[bytes[i]! % API_KEY_CHARSET.length]
  }

  return `${API_KEY_PREFIX}${secret}`
}

export function isApiIntegrationKeyCopyable(key: string): boolean {
  return API_KEY_PATTERN.test(key)
}

export function readPersistedApiIntegrationKey(): string | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(API_INTEGRATION_KEY_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { key?: unknown }
    return typeof parsed.key === 'string' && parsed.key.length > 0 ? parsed.key : null
  } catch {
    return null
  }
}

export function writePersistedApiIntegrationKey(key: string) {
  if (!import.meta.client) {
    return
  }

  try {
    localStorage.setItem(
      API_INTEGRATION_KEY_STORAGE_KEY,
      JSON.stringify({ key, savedAt: new Date().toISOString() }),
    )
  } catch {
    /* ignore */
  }
}
