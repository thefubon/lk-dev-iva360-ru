import {
  cloneNotificationChannels,
  createDefaultNotificationChannels,
  normalizePersistedChannels,
} from '@lib/notifications/default-notification-data'
import {
  NOTIFICATION_CHANNELS_STORAGE_KEY,
  NOTIFICATION_CHANNEL_ORDER,
  type NotificationChannelId,
  type NotificationChannelsPersistedState,
  type NotificationChannelsState,
} from '@lib/notifications/types'

function readPersistedState(): NotificationChannelsPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(NOTIFICATION_CHANNELS_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as {
      channels?: unknown
      savedAt?: string
    }

    const channels = normalizePersistedChannels(parsed.channels)
    if (!channels || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { channels, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(channels: NotificationChannelsState) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: NotificationChannelsPersistedState = {
      channels: cloneNotificationChannels(channels),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(NOTIFICATION_CHANNELS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function useNotificationChannels() {
  const channels = reactive<NotificationChannelsState>(createDefaultNotificationChannels())
  const ready = ref(false)

  function persist() {
    writePersistedState(channels)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    Object.assign(
      channels,
      persisted?.channels ?? createDefaultNotificationChannels(),
    )
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function setChannelEnabled(channelId: NotificationChannelId, enabled: boolean) {
    channels[channelId].enabled = enabled
    persist()
  }

  function updateChannelField(
    channelId: NotificationChannelId,
    field: 'fromAddress' | 'gatewayUrl' | 'botWebhookUrl',
    value: string,
  ) {
    channels[channelId][field] = value
    persist()
  }

  const enabledChannelIds = computed(() =>
    NOTIFICATION_CHANNEL_ORDER.filter((channelId) => channels[channelId].enabled),
  )

  return {
    channels,
    ready,
    enabledChannelIds,
    setChannelEnabled,
    updateChannelField,
    persist,
  }
}
