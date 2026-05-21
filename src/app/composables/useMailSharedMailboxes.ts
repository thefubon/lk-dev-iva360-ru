import {
  cloneSharedMailboxes,
  createDefaultSharedMailboxes,
  normalizePersistedSharedMailboxes,
} from '@lib/mail/default-mail-additional-data'
import {
  MAIL_SHARED_MAILBOXES_STORAGE_KEY,
  type MailSharedMailbox,
  type MailSharedMailboxesPersistedState,
  type SharedMailboxPayload,
} from '@lib/mail/additional-settings-types'

function readPersistedState(): MailSharedMailboxesPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_SHARED_MAILBOXES_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { mailboxes?: unknown, savedAt?: string }
    const mailboxes = normalizePersistedSharedMailboxes(parsed.mailboxes)
    if (!mailboxes || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { mailboxes, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(mailboxes: MailSharedMailbox[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailSharedMailboxesPersistedState = {
      mailboxes: cloneSharedMailboxes(mailboxes),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_SHARED_MAILBOXES_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function createMailboxId(name: string): string {
  return `shared-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}`
}

export function useMailSharedMailboxes() {
  const mailboxes = ref<MailSharedMailbox[]>(createDefaultSharedMailboxes())
  const ready = ref(false)

  function persist() {
    writePersistedState(mailboxes.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    mailboxes.value = persisted?.mailboxes ?? createDefaultSharedMailboxes()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function addMailbox(payload: SharedMailboxPayload): MailSharedMailbox {
    const mailbox: MailSharedMailbox = {
      id: createMailboxId(payload.name),
      ...payload,
    }
    mailboxes.value = [...mailboxes.value, mailbox]
    persist()
    return mailbox
  }

  function updateMailbox(id: string, payload: SharedMailboxPayload) {
    mailboxes.value = mailboxes.value.map(mailbox =>
      mailbox.id === id ? { ...mailbox, ...payload } : mailbox,
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
