export const MAIL_MAILING_GROUPS_STORAGE_KEY = 'iva360:mail-mailing-groups'
export const MAIL_SHARED_MAILBOXES_STORAGE_KEY = 'iva360:mail-shared-mailboxes'
export const MAIL_CATCH_ALL_STORAGE_KEY = 'iva360:mail-catch-all'
export const MAIL_DELEGATED_MAILBOXES_STORAGE_KEY = 'iva360:mail-delegated-mailboxes'
export const MAIL_RULES_STORAGE_KEY = 'iva360:mail-rules'
export const MAIL_SYNC_SETTINGS_STORAGE_KEY = 'iva360:mail-sync-settings'
export const MAIL_QUEUE_STATS_STORAGE_KEY = 'iva360:mail-queue-stats'

export interface MailMailingGroup {
  id: string
  name: string
  address: string
  membersCount: number
}

export interface MailMailingGroupsPersistedState {
  groups: MailMailingGroup[]
  savedAt: string
}

export interface MailSharedMailbox {
  id: string
  name: string
  address: string
  accessCount: number
  accessLabel: string
}

export interface MailSharedMailboxesPersistedState {
  mailboxes: MailSharedMailbox[]
  savedAt: string
}

export interface MailCatchAllConfig {
  enabled: boolean
  domain: string
  localPart: string
}

export interface MailCatchAllPersistedState {
  config: MailCatchAllConfig
  savedAt: string
}

export type MailDelegatedPermission = 'read' | 'send' | 'manage'

export interface MailDelegatedMailbox {
  id: string
  ownerEmail: string
  delegateEmail: string
  permissions: MailDelegatedPermission[]
}

export interface MailDelegatedMailboxesPersistedState {
  mailboxes: MailDelegatedMailbox[]
  savedAt: string
}

export type MailRuleAction = 'reject' | 'forward' | 'move' | 'tag'
export type MailRuleStatus = 'enabled' | 'disabled'

export interface MailRule {
  id: string
  priority: number
  condition: string
  action: MailRuleAction
  actionLabel: string
  status: MailRuleStatus
}

export interface MailRulesPersistedState {
  rules: MailRule[]
  savedAt: string
}

export interface MailSyncSettings {
  caldavCalendars: boolean
  carddavGal: boolean
  activeSyncEas: boolean
  easRequirePin: boolean
}

export interface MailSyncSettingsPersistedState {
  settings: MailSyncSettings
  savedAt: string
}

export type MailQueueHealth = 'normal' | 'warning' | 'critical'

export interface MailQueueStats {
  health: MailQueueHealth
  healthLabel: string
  inQueue: number
  deferred: number
  undelivered: number
}

export type MailServerServiceStatus = 'online' | 'offline'

export interface MailServerService {
  id: string
  name: string
  status: MailServerServiceStatus
}

export interface MailQueuePersistedState {
  queue: MailQueueStats
  servers: MailServerService[]
  savedAt: string
}

export interface MailingGroupPayload {
  name: string
  address: string
  membersCount: number
}

export interface SharedMailboxPayload {
  name: string
  address: string
  accessCount: number
  accessLabel: string
}

export interface CatchAllPayload {
  enabled: boolean
  domain: string
  localPart: string
}

export interface DelegatedMailboxPayload {
  ownerEmail: string
  delegateEmail: string
  permissions: MailDelegatedPermission[]
}

export interface MailRulePayload {
  priority: number
  condition: string
  action: MailRuleAction
  actionLabel: string
  status: MailRuleStatus
}

export const MAIL_RULE_ACTION_LABELS: Record<MailRuleAction, string> = {
  reject: 'Отклонить',
  forward: 'Переслать',
  move: 'Переместить',
  tag: 'Пометить',
}

export const MAIL_DELEGATED_PERMISSION_LABELS: Record<MailDelegatedPermission, string> = {
  read: 'Чтение',
  send: 'Отправка',
  manage: 'Управление',
}
