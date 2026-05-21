import {
  createDefaultMailQueueStats,
  createDefaultMailServerServices,
} from '@lib/mail/default-mail-additional-data'
import type {
  MailQueuePersistedState,
  MailQueueStats,
  MailServerService,
} from '@lib/mail/additional-settings-types'
import { MAIL_QUEUE_STATS_STORAGE_KEY } from '@lib/mail/additional-settings-types'

function readPersistedState(): MailQueuePersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_QUEUE_STATS_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as {
      queue?: unknown
      servers?: unknown
      savedAt?: string
    }

    const queue = parsed.queue as MailQueueStats | undefined
    const servers = parsed.servers as MailServerService[] | undefined

    if (
      !queue
      || typeof queue.inQueue !== 'number'
      || !Array.isArray(servers)
      || typeof parsed.savedAt !== 'string'
    ) {
      return null
    }

    return {
      queue: { ...queue },
      servers: servers.map(server => ({ ...server })),
      savedAt: parsed.savedAt,
    }
  } catch {
    return null
  }
}

function writePersistedState(queue: MailQueueStats, servers: MailServerService[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailQueuePersistedState = {
      queue: { ...queue },
      servers: servers.map(server => ({ ...server })),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_QUEUE_STATS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function useMailQueueStats() {
  const queue = ref<MailQueueStats>(createDefaultMailQueueStats())
  const servers = ref<MailServerService[]>(createDefaultMailServerServices())
  const ready = ref(false)

  function persist() {
    writePersistedState(queue.value, servers.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    queue.value = persisted?.queue ?? createDefaultMailQueueStats()
    servers.value = persisted?.servers ?? createDefaultMailServerServices()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function refreshQueue() {
    queue.value = {
      ...queue.value,
      inQueue: Math.max(0, queue.value.inQueue + Math.floor(Math.random() * 5) - 2),
      deferred: Math.max(0, queue.value.deferred + Math.floor(Math.random() * 3) - 1),
    }
    persist()
  }

  return {
    queue,
    servers,
    ready,
    persist,
    refreshQueue,
  }
}
