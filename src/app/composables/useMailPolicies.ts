import {
  cloneMailPolicies,
  createDefaultMailPolicies,
  normalizePersistedPolicies,
} from '@lib/mail/default-mail-data'
import {
  MAIL_POLICIES_STORAGE_KEY,
  type MailPolicies,
  type MailPoliciesPersistedState,
} from '@lib/mail/types'

function readPersistedState(): MailPoliciesPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_POLICIES_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as {
      policies?: unknown
      savedAt?: string
    }

    const policies = normalizePersistedPolicies(parsed.policies)
    if (!policies || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { policies, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(policies: MailPolicies) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailPoliciesPersistedState = {
      policies: cloneMailPolicies(policies),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_POLICIES_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function useMailPolicies() {
  const policies = reactive<MailPolicies>(createDefaultMailPolicies())
  const ready = ref(false)

  function persist() {
    writePersistedState(policies)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    Object.assign(policies, persisted?.policies ?? createDefaultMailPolicies())
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function savePolicies() {
    persist()
  }

  return {
    policies,
    ready,
    persist,
    savePolicies,
  }
}
