import {
  cloneDelegatedMailboxes,
  createDefaultDelegatedMailboxes,
  normalizePersistedDelegatedMailboxes,
} from '@lib/mail/default-mail-additional-data'
import {
  MAIL_DELEGATED_MAILBOXES_STORAGE_KEY,
  type DelegatedMailboxPayload,
  type MailDelegatedMailbox,
  type MailDelegatedMailboxesPersistedState,
} from '@lib/mail/additional-settings-types'

function readPersistedState(): MailDelegatedMailboxesPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_DELEGATED_MAILBOXES_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { mailboxes?: unknown, savedAt?: string }
    const mailboxes = normalizePersistedDelegatedMailboxes(parsed.mailboxes)
    if (!mailboxes || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { mailboxes, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(mailboxes: MailDelegatedMailbox[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailDelegatedMailboxesPersistedState = {
      mailboxes: cloneDelegatedMailboxes(mailboxes),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_DELEGATED_MAILBOXES_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function createDelegatedId(): string {
  return `delegated-${Date.now()}`
}

export function useMailDelegatedMailboxes() {
  const mailboxes = ref<MailDelegatedMailbox[]>(createDefaultDelegatedMailboxes())
  const ready = ref(false)

  function persist() {
    writePersistedState(mailboxes.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    mailboxes.value = persisted?.mailboxes ?? createDefaultDelegatedMailboxes()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function addMailbox(payload: DelegatedMailboxPayload): MailDelegatedMailbox {
    const mailbox: MailDelegatedMailbox = {
      id: createDelegatedId(),
      ...payload,
      permissions: [...payload.permissions],
    }
    mailboxes.value = [...mailboxes.value, mailbox]
    persist()
    return mailbox
  }

  function updateMailbox(id: string, payload: DelegatedMailboxPayload) {
    mailboxes.value = mailboxes.value.map(mailbox =>
      mailbox.id === id
        ? { ...mailbox, ...payload, permissions: [...payload.permissions] }
        : mailbox,
    )
    persist()
  }

  function removeMailbox(id: string) {
    mailboxes.value = mailboxes.value.filter(mailbox => mailbox.id !== id)
    persist()
  }

  return {
    mailboxes,
    ready,
    persist,
    addMailbox,
    updateMailbox,
    removeMailbox,
  }
}
