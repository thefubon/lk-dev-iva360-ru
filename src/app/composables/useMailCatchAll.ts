import { createDefaultCatchAllConfig } from '@lib/mail/default-mail-additional-data'
import {
  MAIL_CATCH_ALL_STORAGE_KEY,
  type CatchAllPayload,
  type MailCatchAllConfig,
  type MailCatchAllPersistedState,
} from '@lib/mail/additional-settings-types'

function readPersistedState(): MailCatchAllPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_CATCH_ALL_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { config?: unknown, savedAt?: string }
    const config = parsed.config as MailCatchAllConfig | undefined
    if (
      !config
      || typeof config.enabled !== 'boolean'
      || typeof config.domain !== 'string'
      || typeof config.localPart !== 'string'
      || typeof parsed.savedAt !== 'string'
    ) {
      return null
    }

    return { config: { ...config }, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(config: MailCatchAllConfig) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailCatchAllPersistedState = {
      config: { ...config },
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_CATCH_ALL_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function useMailCatchAll() {
  const config = ref<MailCatchAllConfig>(createDefaultCatchAllConfig())
  const ready = ref(false)

  const fullAddress = computed(() =>
    config.value.enabled && config.value.localPart && config.value.domain
      ? `${config.value.localPart}@${config.value.domain}`
      : '',
  )

  function persist() {
    writePersistedState(config.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    config.value = persisted?.config ?? createDefaultCatchAllConfig()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function saveConfig(payload: CatchAllPayload) {
    config.value = { ...payload }
    persist()
  }

  return {
    config,
    fullAddress,
    ready,
    persist,
    saveConfig,
  }
}
