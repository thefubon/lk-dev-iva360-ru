import type {
  MailCatchAllConfig,
  MailDelegatedMailbox,
  MailMailingGroup,
  MailQueueStats,
  MailRule,
  MailServerService,
  MailSharedMailbox,
  MailSyncSettings,
} from './additional-settings-types'
import { MAIL_RULE_ACTION_LABELS } from './additional-settings-types'

const DEFAULT_DOMAIN = 'example-corp.ru'

export function createDefaultMailingGroups(): MailMailingGroup[] {
  return [
    {
      id: 'group-marketing',
      name: 'Маркетинг',
      address: `marketing@${DEFAULT_DOMAIN}`,
      membersCount: 12,
    },
    {
      id: 'group-all',
      name: 'Все сотрудники',
      address: `all@${DEFAULT_DOMAIN}`,
      membersCount: 247,
    },
  ]
}

export function cloneMailingGroups(groups: MailMailingGroup[]): MailMailingGroup[] {
  return groups.map(group => ({ ...group }))
}

export function normalizePersistedMailingGroups(value: unknown): MailMailingGroup[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const groups = value
    .filter((item): item is MailMailingGroup =>
      typeof item === 'object'
      && item !== null
      && typeof (item as MailMailingGroup).id === 'string'
      && typeof (item as MailMailingGroup).name === 'string'
      && typeof (item as MailMailingGroup).address === 'string'
      && typeof (item as MailMailingGroup).membersCount === 'number',
    )
    .map(item => ({ ...item }))

  return groups.length > 0 ? groups : null
}

export function createDefaultSharedMailboxes(): MailSharedMailbox[] {
  return [
    {
      id: 'shared-support',
      name: 'Поддержка',
      address: `support@${DEFAULT_DOMAIN}`,
      accessCount: 3,
      accessLabel: '3 чел.',
    },
    {
      id: 'shared-hr',
      name: 'HR',
      address: `hr@${DEFAULT_DOMAIN}`,
      accessCount: 5,
      accessLabel: '5 чел.',
    },
  ]
}

export function cloneSharedMailboxes(mailboxes: MailSharedMailbox[]): MailSharedMailbox[] {
  return mailboxes.map(mailbox => ({ ...mailbox }))
}

export function normalizePersistedSharedMailboxes(value: unknown): MailSharedMailbox[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const mailboxes = value
    .filter((item): item is MailSharedMailbox =>
      typeof item === 'object'
      && item !== null
      && typeof (item as MailSharedMailbox).id === 'string'
      && typeof (item as MailSharedMailbox).name === 'string'
      && typeof (item as MailSharedMailbox).address === 'string',
    )
    .map(item => ({
      ...item,
      accessCount: typeof item.accessCount === 'number' ? item.accessCount : 0,
      accessLabel: typeof item.accessLabel === 'string' ? item.accessLabel : `${item.accessCount ?? 0} чел.`,
    }))

  return mailboxes.length > 0 ? mailboxes : null
}

export function createDefaultCatchAllConfig(): MailCatchAllConfig {
  return {
    enabled: true,
    domain: DEFAULT_DOMAIN,
    localPart: 'lost-mail',
  }
}

export function createDefaultDelegatedMailboxes(): MailDelegatedMailbox[] {
  return [
    {
      id: 'delegated-ceo',
      ownerEmail: `ceo@${DEFAULT_DOMAIN}`,
      delegateEmail: `assistant@${DEFAULT_DOMAIN}`,
      permissions: ['read', 'send'],
    },
  ]
}

export function cloneDelegatedMailboxes(mailboxes: MailDelegatedMailbox[]): MailDelegatedMailbox[] {
  return mailboxes.map(mailbox => ({
    ...mailbox,
    permissions: [...mailbox.permissions],
  }))
}

export function normalizePersistedDelegatedMailboxes(value: unknown): MailDelegatedMailbox[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const mailboxes = value
    .filter((item): item is MailDelegatedMailbox =>
      typeof item === 'object'
      && item !== null
      && typeof (item as MailDelegatedMailbox).id === 'string'
      && typeof (item as MailDelegatedMailbox).ownerEmail === 'string'
      && typeof (item as MailDelegatedMailbox).delegateEmail === 'string'
      && Array.isArray((item as MailDelegatedMailbox).permissions),
    )
    .map(item => ({
      ...item,
      permissions: item.permissions.filter(
        permission => permission === 'read' || permission === 'send' || permission === 'manage',
      ),
    }))

  return mailboxes
}

export function createDefaultMailRules(): MailRule[] {
  return [
    {
      id: 'rule-spam',
      priority: 100,
      condition: 'От: @spam.ru',
      action: 'reject',
      actionLabel: MAIL_RULE_ACTION_LABELS.reject,
      status: 'enabled',
    },
    {
      id: 'rule-archive',
      priority: 50,
      condition: 'Тема содержит: [архив]',
      action: 'move',
      actionLabel: 'В папку «Архив»',
      status: 'enabled',
    },
  ]
}

export function cloneMailRules(rules: MailRule[]): MailRule[] {
  return rules.map(rule => ({ ...rule }))
}

export function normalizePersistedMailRules(value: unknown): MailRule[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const rules = value
    .filter((item): item is MailRule =>
      typeof item === 'object'
      && item !== null
      && typeof (item as MailRule).id === 'string'
      && typeof (item as MailRule).priority === 'number'
      && typeof (item as MailRule).condition === 'string',
    )
    .map(item => ({ ...item }))

  return rules.length > 0 ? rules : null
}

export function createDefaultMailSyncSettings(): MailSyncSettings {
  return {
    caldavCalendars: true,
    carddavGal: true,
    activeSyncEas: true,
    easRequirePin: false,
  }
}

export function createDefaultMailQueueStats(): MailQueueStats {
  return {
    health: 'normal',
    healthLabel: 'Норма',
    inQueue: 14,
    deferred: 3,
    undelivered: 1,
  }
}

export function createDefaultMailServerServices(): MailServerService[] {
  return [
    { id: 'smtp', name: 'SMTP', status: 'online' },
    { id: 'imap', name: 'IMAP', status: 'online' },
    { id: 'caldav', name: 'CalDAV', status: 'online' },
  ]
}
