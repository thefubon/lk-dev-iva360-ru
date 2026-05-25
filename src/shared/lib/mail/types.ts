export const MAIL_DOMAINS_STORAGE_KEY = 'iva360:mail-domains'
export const MAIL_POLICIES_STORAGE_KEY = 'iva360:mail-policies'
export const MAIL_MAILBOXES_STORAGE_KEY = 'iva360:mail-mailboxes'

import {
  mailAdditionalSettingsPath,
  type MailAdditionalSection,
} from './mail-additional-settings'

export const MAIL_NAV_SECTIONS = ['domains', 'mailboxes', 'settings'] as const
export type MailNavSection = (typeof MAIL_NAV_SECTIONS)[number]

export const MAIL_NAV_SECTION_LABELS: Record<MailNavSection, string> = {
  domains: 'Почтовые домены',
  mailboxes: 'Почтовые ящики',
  settings: 'Дополнительные настройки',
}

export const MAIL_NAV_SECTION_ROUTES: Record<MailNavSection, string> = {
  domains: '/admin/mail/domains',
  mailboxes: '/admin/mail/mailboxes',
  settings: '/admin/mail/settings',
}

/** @deprecated Use MAIL_NAV_SECTIONS and MAIL_ADDITIONAL_SECTIONS */
export const MAIL_SECTIONS = [
  'domains',
  'mailboxes',
  'settings',
  ...(['groups', 'rules', 'queue', 'caldav'] as const),
] as const
export type MailSection = (typeof MAIL_SECTIONS)[number]

export const MAIL_SECTION_LABELS: Record<MailSection, string> = {
  domains: MAIL_NAV_SECTION_LABELS.domains,
  mailboxes: MAIL_NAV_SECTION_LABELS.mailboxes,
  settings: MAIL_NAV_SECTION_LABELS.settings,
  groups: 'Группы рассылки',
  rules: 'Правила фильтрации',
  queue: 'Очередь исходящих',
  caldav: 'CalDAV / EAS sync',
}

export const MAIL_SECTION_ROUTES: Record<MailSection, string> = {
  domains: MAIL_NAV_SECTION_ROUTES.domains,
  mailboxes: MAIL_NAV_SECTION_ROUTES.mailboxes,
  settings: MAIL_NAV_SECTION_ROUTES.settings,
  groups: mailAdditionalSettingsPath('groups'),
  rules: mailAdditionalSettingsPath('rules'),
  queue: mailAdditionalSettingsPath('queue'),
  caldav: mailAdditionalSettingsPath('caldav'),
}

export const MAIL_STUB_SECTIONS: MailAdditionalSection[] = []

export type DnsRecordStatus = 'ok' | 'fail'
export type MailDomainStatus = 'online' | 'warning'
export type SmtpEncryption = 'tls' | 'ssl' | 'none'

export interface MailDomainPolicyShortcuts {
  archiveEnabled: boolean
  archiveRetentionDays: number
  spamCleanupEnabled: boolean
  spamRetentionDays: number
  trashCleanupEnabled: boolean
  trashRetentionDays: number
  corporateSignatureEnabled: boolean
  maxIncomingMb: number
  maxOutgoingMb: number
  maxAttachmentMb: number
}

export interface MailDomain {
  id: string
  name: string
  status: MailDomainStatus
  isPrimary: boolean
  dkim: DnsRecordStatus
  spf: DnsRecordStatus
  dmarc: DnsRecordStatus
  dkimSelector: string
  dkimPublicKey: string
  description: string
  smtpHost: string
  smtpPort: number
  smtpEncryption: SmtpEncryption
  smtpLogin: string
  smtpPassword: string
  imapHost: string
  imapPort: number
  pop3Port: number
  /** @deprecated use imapHost */
  serverHost?: string
  /** @deprecated use imapPort */
  serverPort?: number
  policies: MailDomainPolicyShortcuts
}

export interface MailDomainsPersistedState {
  domains: MailDomain[]
  savedAt: string
}

export interface MailDomainSettings {
  allowSubdomains: boolean
  catchAllEnabled: boolean
  catchAllAddress: string
}

export interface MailArchivePolicy {
  enabled: boolean
  retentionDays: number
}

export interface MailSpamCleanupPolicy {
  enabled: boolean
  retentionDays: number
}

export interface MailTrashCleanupPolicy {
  enabled: boolean
  retentionDays: number
}

export interface MailCorporateSignature {
  enabled: boolean
  html: string
}

export interface MailEmailSizeLimits {
  maxIncomingMb: number
  maxOutgoingMb: number
  maxAttachmentMb: number
}

export interface MailPolicies {
  domainSettings: MailDomainSettings
  archivePolicy: MailArchivePolicy
  spamCleanupPolicy: MailSpamCleanupPolicy
  trashCleanupPolicy: MailTrashCleanupPolicy
  corporateSignature: MailCorporateSignature
  emailSizeLimits: MailEmailSizeLimits
}

export interface MailPoliciesPersistedState {
  policies: MailPolicies
  savedAt: string
}

export interface AddMailServerPayload {
  serverHost: string
  domainName: string
  imapPort: number
  smtpPort: number
  description: string
}

export type MailMailboxStatus = 'active' | 'blocked'

export interface MailMailbox {
  id: string
  userName: string
  localPart: string
  domain: string
  quotaGb: number
  quotaUnlimited: boolean
  usedBytes: number
  status: MailMailboxStatus
}

export interface MailMailboxesPersistedState {
  mailboxes: MailMailbox[]
  savedAt: string
}

export interface CreateMailMailboxPayload {
  userName: string
  localPart: string
  domain: string
  quotaGb: number
  quotaUnlimited: boolean
  status: MailMailboxStatus
}

export interface UpdateMailMailboxQuotaPayload {
  quotaGb: number
  quotaUnlimited: boolean
}
