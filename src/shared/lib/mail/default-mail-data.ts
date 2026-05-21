import type { MailDomain, MailDomainPolicyShortcuts, MailPolicies, SmtpEncryption } from './types'

export function createDefaultDomainPolicies(): MailDomainPolicyShortcuts {
  return {
    archiveEnabled: true,
    archiveRetentionDays: 365,
    spamCleanupEnabled: true,
    spamRetentionDays: 30,
    trashCleanupEnabled: true,
    trashRetentionDays: 14,
    corporateSignatureEnabled: true,
    maxIncomingMb: 50,
    maxOutgoingMb: 35,
    maxAttachmentMb: 25,
  }
}

function defaultSmtpForHost(host: string) {
  return {
    smtpHost: host.replace(/^mail\./, 'smtp.') || host,
    smtpPort: 587,
    smtpEncryption: 'tls' as SmtpEncryption,
    smtpLogin: 'postmaster',
    smtpPassword: '',
  }
}

export function createMailDomainFromPayload(
  id: string,
  payload: {
    domainName: string
    serverHost: string
    imapPort: number
    smtpPort: number
    description: string
    isPrimary?: boolean
  },
): MailDomain {
  const imapHost = payload.serverHost.trim()
  const smtp = defaultSmtpForHost(imapHost)

  return {
    id,
    name: payload.domainName.trim(),
    status: 'online',
    isPrimary: payload.isPrimary ?? false,
    dkim: 'fail',
    spf: 'fail',
    dmarc: 'fail',
    dkimSelector: 'default',
    dkimPublicKey: '',
    description: payload.description.trim(),
    imapHost,
    imapPort: payload.imapPort,
    pop3Port: 995,
    ...smtp,
    smtpPort: payload.smtpPort,
    policies: createDefaultDomainPolicies(),
  }
}

export function createDefaultMailDomains(): MailDomain[] {
  return [
    {
      ...createMailDomainFromPayload('domain-example-corp', {
        domainName: 'example-corp.ru',
        serverHost: 'mail.example-corp.ru',
        imapPort: 993,
        smtpPort: 587,
        description: 'Основной почтовый сервер компании',
        isPrimary: true,
      }),
      status: 'online',
      dkim: 'ok',
      spf: 'ok',
      dmarc: 'ok',
      dkimSelector: 'iva360',
      dkimPublicKey: 'v=DKIM1; k=rsa; p=MIGfMA0GCSq...',
      smtpHost: 'smtp.example-corp.ru',
      smtpPort: 587,
      smtpEncryption: 'tls',
      smtpLogin: 'postmaster@example-corp.ru',
      smtpPassword: '',
    },
    {
      ...createMailDomainFromPayload('domain-corp-example', {
        domainName: 'corp.example.ru',
        serverHost: 'mail.corp.example.ru',
        imapPort: 993,
        smtpPort: 587,
        description: 'Дополнительный домен для подразделений',
      }),
      status: 'warning',
      dkim: 'ok',
      spf: 'fail',
      dmarc: 'ok',
    },
    {
      ...createMailDomainFromPayload('domain-test', {
        domainName: 'test-domain.ru',
        serverHost: 'mail.test-domain.ru',
        imapPort: 993,
        smtpPort: 587,
        description: 'Тестовый домен для проверки DNS',
      }),
      status: 'online',
      dkim: 'fail',
      spf: 'ok',
      dmarc: 'fail',
    },
  ]
}

export function createDefaultMailPolicies(): MailPolicies {
  return {
    domainSettings: {
      allowSubdomains: true,
      catchAllEnabled: false,
      catchAllAddress: 'postmaster@example-corp.ru',
    },
    archivePolicy: {
      enabled: true,
      retentionDays: 365,
    },
    spamCleanupPolicy: {
      enabled: true,
      retentionDays: 30,
    },
    trashCleanupPolicy: {
      enabled: true,
      retentionDays: 14,
    },
    corporateSignature: {
      enabled: true,
      html: 'С уважением,\nКоманда IVA 360\nhttps://iva360.ru',
    },
    emailSizeLimits: {
      maxIncomingMb: 50,
      maxOutgoingMb: 35,
      maxAttachmentMb: 25,
    },
  }
}

export function cloneMailDomains(domains: MailDomain[]): MailDomain[] {
  return domains.map(domain => ({
    ...domain,
    policies: { ...domain.policies },
  }))
}

export function cloneMailPolicies(policies: MailPolicies): MailPolicies {
  return {
    domainSettings: { ...policies.domainSettings },
    archivePolicy: { ...policies.archivePolicy },
    spamCleanupPolicy: { ...policies.spamCleanupPolicy },
    trashCleanupPolicy: { ...policies.trashCleanupPolicy },
    corporateSignature: { ...policies.corporateSignature },
    emailSizeLimits: { ...policies.emailSizeLimits },
  }
}

function normalizeSmtpEncryption(value: unknown): SmtpEncryption {
  if (value === 'ssl' || value === 'none') {
    return value
  }
  return 'tls'
}

function normalizeDomainPolicies(value: unknown): MailDomainPolicyShortcuts {
  const defaults = createDefaultDomainPolicies()
  if (typeof value !== 'object' || value === null) {
    return defaults
  }

  const raw = value as Partial<MailDomainPolicyShortcuts>
  return {
    archiveEnabled: raw.archiveEnabled ?? defaults.archiveEnabled,
    archiveRetentionDays: raw.archiveRetentionDays ?? defaults.archiveRetentionDays,
    spamCleanupEnabled: raw.spamCleanupEnabled ?? defaults.spamCleanupEnabled,
    spamRetentionDays: raw.spamRetentionDays ?? defaults.spamRetentionDays,
    trashCleanupEnabled: raw.trashCleanupEnabled ?? defaults.trashCleanupEnabled,
    trashRetentionDays: raw.trashRetentionDays ?? defaults.trashRetentionDays,
    corporateSignatureEnabled:
      raw.corporateSignatureEnabled ?? defaults.corporateSignatureEnabled,
    maxIncomingMb: raw.maxIncomingMb ?? defaults.maxIncomingMb,
    maxOutgoingMb: raw.maxOutgoingMb ?? defaults.maxOutgoingMb,
    maxAttachmentMb: raw.maxAttachmentMb ?? defaults.maxAttachmentMb,
  }
}

export function normalizePersistedDomain(item: unknown): MailDomain | null {
  if (typeof item !== 'object' || item === null) {
    return null
  }

  const raw = item as Partial<MailDomain>
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') {
    return null
  }

  const imapHost =
    typeof raw.imapHost === 'string'
      ? raw.imapHost
      : typeof raw.serverHost === 'string'
        ? raw.serverHost
        : ''
  const imapPort =
    typeof raw.imapPort === 'number'
      ? raw.imapPort
      : typeof raw.serverPort === 'number'
        ? raw.serverPort
        : 993
  const smtp = defaultSmtpForHost(imapHost)

  return {
    id: raw.id,
    name: raw.name,
    status: raw.status === 'warning' ? 'warning' : 'online',
    isPrimary: Boolean(raw.isPrimary),
    dkim: raw.dkim === 'fail' ? 'fail' : 'ok',
    spf: raw.spf === 'fail' ? 'fail' : 'ok',
    dmarc: raw.dmarc === 'fail' ? 'fail' : 'ok',
    dkimSelector: typeof raw.dkimSelector === 'string' ? raw.dkimSelector : 'default',
    dkimPublicKey: typeof raw.dkimPublicKey === 'string' ? raw.dkimPublicKey : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    smtpHost: typeof raw.smtpHost === 'string' ? raw.smtpHost : smtp.smtpHost,
    smtpPort: typeof raw.smtpPort === 'number' ? raw.smtpPort : smtp.smtpPort,
    smtpEncryption: normalizeSmtpEncryption(raw.smtpEncryption),
    smtpLogin: typeof raw.smtpLogin === 'string' ? raw.smtpLogin : smtp.smtpLogin,
    smtpPassword: typeof raw.smtpPassword === 'string' ? raw.smtpPassword : '',
    imapHost,
    imapPort,
    pop3Port: typeof raw.pop3Port === 'number' ? raw.pop3Port : 995,
    policies: normalizeDomainPolicies(raw.policies),
  }
}

export function normalizePersistedDomains(value: unknown): MailDomain[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const domains: MailDomain[] = []

  for (const item of value) {
    const domain = normalizePersistedDomain(item)
    if (domain) {
      domains.push(domain)
    }
  }

  return domains.length > 0 ? domains : null
}

export function normalizePersistedPolicies(value: unknown): MailPolicies | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const defaults = createDefaultMailPolicies()
  const raw = value as Partial<MailPolicies>

  return {
    domainSettings: {
      allowSubdomains: raw.domainSettings?.allowSubdomains ?? defaults.domainSettings.allowSubdomains,
      catchAllEnabled: raw.domainSettings?.catchAllEnabled ?? defaults.domainSettings.catchAllEnabled,
      catchAllAddress: raw.domainSettings?.catchAllAddress ?? defaults.domainSettings.catchAllAddress,
    },
    archivePolicy: {
      enabled: raw.archivePolicy?.enabled ?? defaults.archivePolicy.enabled,
      retentionDays: raw.archivePolicy?.retentionDays ?? defaults.archivePolicy.retentionDays,
    },
    spamCleanupPolicy: {
      enabled: raw.spamCleanupPolicy?.enabled ?? defaults.spamCleanupPolicy.enabled,
      retentionDays: raw.spamCleanupPolicy?.retentionDays ?? defaults.spamCleanupPolicy.retentionDays,
    },
    trashCleanupPolicy: {
      enabled: raw.trashCleanupPolicy?.enabled ?? defaults.trashCleanupPolicy.enabled,
      retentionDays: raw.trashCleanupPolicy?.retentionDays ?? defaults.trashCleanupPolicy.retentionDays,
    },
    corporateSignature: {
      enabled: raw.corporateSignature?.enabled ?? defaults.corporateSignature.enabled,
      html: raw.corporateSignature?.html ?? defaults.corporateSignature.html,
    },
    emailSizeLimits: {
      maxIncomingMb: raw.emailSizeLimits?.maxIncomingMb ?? defaults.emailSizeLimits.maxIncomingMb,
      maxOutgoingMb: raw.emailSizeLimits?.maxOutgoingMb ?? defaults.emailSizeLimits.maxOutgoingMb,
      maxAttachmentMb: raw.emailSizeLimits?.maxAttachmentMb ?? defaults.emailSizeLimits.maxAttachmentMb,
    },
  }
}
