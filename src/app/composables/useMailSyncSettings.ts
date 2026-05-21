import { createDefaultMailSyncSettings } from '@lib/mail/default-mail-additional-data'
import {
  MAIL_SYNC_SETTINGS_STORAGE_KEY,
  type MailSyncSettings,
  type MailSyncSettingsPersistedState,
} from '@lib/mail/additional-settings-types'

function readPersistedState(): MailSyncSettingsPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_SYNC_SETTINGS_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { settings?: unknown, savedAt?: string }
    const settings = parsed.settings as MailSyncSettings | undefined
    if (
      !settings
      || typeof settings.caldavCalendars !== 'boolean'
      || typeof settings.carddavGal !== 'boolean'
      || typeof settings.activeSyncEas !== 'boolean'
      || typeof settings.easRequirePin !== 'boolean'
      || typeof parsed.savedAt !== 'string'
    ) {
      return null
    }

    return { settings: { ...settings }, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(settings: MailSyncSettings) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailSyncSettingsPersistedState = {
      settings: { ...settings },
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_SYNC_SETTINGS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function useMailSyncSettings() {
  const settings = reactive<MailSyncSettings>(createDefaultMailSyncSettings())
  const ready = ref(false)

  function persist() {
    writePersistedState(settings)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    Object.assign(settings, persisted?.settings ?? createDefaultMailSyncSettings())
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function setSetting<K extends keyof MailSyncSettings>(key: K, value: MailSyncSettings[K]) {
    settings[key] = value
    persist()
  }

  return {
    settings,
    ready,
    persist,
    setSetting,
  }
}
