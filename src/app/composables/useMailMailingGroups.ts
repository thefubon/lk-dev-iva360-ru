import {
  cloneMailingGroups,
  createDefaultMailingGroups,
  normalizePersistedMailingGroups,
} from '@lib/mail/default-mail-additional-data'
import {
  MAIL_MAILING_GROUPS_STORAGE_KEY,
  type MailMailingGroup,
  type MailMailingGroupsPersistedState,
  type MailingGroupPayload,
} from '@lib/mail/additional-settings-types'

function readPersistedState(): MailMailingGroupsPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_MAILING_GROUPS_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { groups?: unknown, savedAt?: string }
    const groups = normalizePersistedMailingGroups(parsed.groups)
    if (!groups || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { groups, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(groups: MailMailingGroup[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailMailingGroupsPersistedState = {
      groups: cloneMailingGroups(groups),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_MAILING_GROUPS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function createGroupId(name: string): string {
  return `group-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}`
}

export function useMailMailingGroups() {
  const groups = ref<MailMailingGroup[]>(createDefaultMailingGroups())
  const ready = ref(false)

  function persist() {
    writePersistedState(groups.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    groups.value = persisted?.groups ?? createDefaultMailingGroups()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function addGroup(payload: MailingGroupPayload): MailMailingGroup {
    const group: MailMailingGroup = {
      id: createGroupId(payload.name),
      ...payload,
    }
    groups.value = [...groups.value, group]
    persist()
    return group
  }

  function updateGroup(id: string, payload: MailingGroupPayload) {
    groups.value = groups.value.map(group =>
      group.id === id ? { ...group, ...payload } : group,
    )
    persist()
  }

  function removeGroup(id: string) {
    groups.value = groups.value.filter(group => group.id !== id)
    persist()
  }

  return {
    groups,
    ready,
    persist,
    addGroup,
    updateGroup,
    removeGroup,
  }
}
