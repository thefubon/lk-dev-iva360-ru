import {
  cloneMailDomains,
  createDefaultMailDomains,
  createMailDomainFromPayload,
  normalizePersistedDomains,
} from '@lib/mail/default-mail-data'
import {
  MAIL_DOMAINS_STORAGE_KEY,
  type AddMailServerPayload,
  type MailDomain,
  type MailDomainsPersistedState,
} from '@lib/mail/types'

function readPersistedState(): MailDomainsPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_DOMAINS_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as {
      domains?: unknown
      savedAt?: string
    }

    const domains = normalizePersistedDomains(parsed.domains)
    if (!domains || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { domains, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(domains: MailDomain[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailDomainsPersistedState = {
      domains: cloneMailDomains(domains),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_DOMAINS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function createDomainId(name: string): string {
  return `domain-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}`
}

export function useMailDomains() {
  const domains = ref<MailDomain[]>(createDefaultMailDomains())
  const ready = ref(false)

  function persist() {
    writePersistedState(domains.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    domains.value = persisted?.domains ?? createDefaultMailDomains()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function addDomain(payload: AddMailServerPayload): MailDomain {
    const domain = createMailDomainFromPayload(createDomainId(payload.domainName), {
      domainName: payload.domainName,
      serverHost: payload.serverHost,
      imapPort: payload.imapPort,
      smtpPort: payload.smtpPort,
      description: payload.description,
      isPrimary: domains.value.length === 0,
    })

    domains.value = [...domains.value, domain]
    persist()
    return domain
  }

  function updateDomain(id: string, patch: Partial<MailDomain>) {
    if (patch.isPrimary) {
      domains.value = domains.value.map(domain => ({
        ...domain,
        ...(domain.id === id ? patch : {}),
        isPrimary: domain.id === id,
      }))
    } else {
      domains.value = domains.value.map(domain =>
        domain.id === id ? { ...domain, ...patch } : domain,
      )
    }
    persist()
  }

  return {
    domains,
    ready,
    persist,
    addDomain,
    updateDomain,
  }
}
