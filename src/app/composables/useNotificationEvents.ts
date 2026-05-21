import {
  cloneNotificationEvents,
  createDefaultNotificationEvents,
  normalizePersistedEvents,
} from '@lib/notifications/default-notification-data'
import {
  NOTIFICATION_EVENTS_STORAGE_KEY,
  type NotificationChannelId,
  type NotificationEvent,
  type NotificationEventsPersistedState,
} from '@lib/notifications/types'

function readPersistedState(): NotificationEventsPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(NOTIFICATION_EVENTS_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as {
      events?: unknown
      savedAt?: string
    }

    const events = normalizePersistedEvents(parsed.events)
    if (!events || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { events, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(events: NotificationEvent[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: NotificationEventsPersistedState = {
      events: cloneNotificationEvents(events),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(NOTIFICATION_EVENTS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function useNotificationEvents() {
  const events = ref<NotificationEvent[]>(createDefaultNotificationEvents())
  const ready = ref(false)
  const testDialogOpen = ref(false)

  function persist() {
    writePersistedState(events.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    events.value = persisted?.events ?? createDefaultNotificationEvents()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function findEvent(eventId: string): NotificationEvent | undefined {
    return events.value.find((event) => event.id === eventId)
  }

  function setEventChannel(
    eventId: string,
    channelId: NotificationChannelId,
    enabled: boolean,
  ) {
    const event = findEvent(eventId)
    if (!event) {
      return
    }

    event.channels[channelId] = enabled
    persist()
  }

  function openTestDialog() {
    testDialogOpen.value = true
  }

  return {
    events,
    ready,
    testDialogOpen,
    setEventChannel,
    openTestDialog,
    persist,
  }
}
