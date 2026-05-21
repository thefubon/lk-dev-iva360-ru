import {
  cloneMailMailboxes,
  createDefaultMailMailboxes,
  createMailMailboxFromPayload,
  normalizePersistedMailboxes,
} from '@lib/mail/default-mail-mailboxes'
import {
  MAIL_MAILBOXES_STORAGE_KEY,
  type CreateMailMailboxPayload,
  type MailMailbox,
  type MailMailboxesPersistedState,
  type UpdateMailMailboxQuotaPayload,
} from '@lib/mail/types'

function readPersistedState(): MailMailboxesPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_MAILBOXES_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as {
      mailboxes?: unknown
      savedAt?: string
    }

    const mailboxes = normalizePersistedMailboxes(parsed.mailboxes)
    if (!mailboxes || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { mailboxes, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(mailboxes: MailMailbox[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailMailboxesPersistedState = {
      mailboxes: cloneMailMailboxes(mailboxes),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_MAILBOXES_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function createMailboxId(localPart: string): string {
  return `mailbox-${localPart.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}`
}

export function useMailMailboxes() {
  const mailboxes = ref<MailMailbox[]>(createDefaultMailMailboxes())
  const ready = ref(false)

  function persist() {
    writePersistedState(mailboxes.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    mailboxes.value = persisted?.mailboxes ?? createDefaultMailMailboxes()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function addMailbox(payload: CreateMailMailboxPayload): MailMailbox {
    const mailbox = createMailMailboxFromPayload(createMailboxId(payload.localPart), payload)
    mailboxes.value = [...mailboxes.value, mailbox]
    persist()
    return mailbox
  }

  function updateMailbox(id: string, patch: Partial<MailMailbox>) {
    mailboxes.value = mailboxes.value.map(mailbox =>
      mailbox.id === id ? { ...mailbox, ...patch } : mailbox,
    )
    persist()
  }

  function updateMailboxesQuota(ids: string[], payload: UpdateMailMailboxQuotaPayload) {
    const idSet = new Set(ids)
    mailboxes.value = mailboxes.value.map((mailbox) => {
      if (!idSet.has(mailbox.id)) {
        return mailbox
      }

      return {
        ...mailbox,
        quotaGb: payload.quotaUnlimited ? 0 : payload.quotaGb,
        quotaUnlimited: payload.quotaUnlimited,
      }
    })
    persist()
  }

  return {
    mailboxes,
    ready,
    persist,
    addMailbox,
    updateMailbox,
    updateMailboxesQuota,
  }
}
