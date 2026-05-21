import { gbToBytes } from './mailbox-utils'
import type { CreateMailMailboxPayload, MailMailbox } from './types'

export function cloneMailMailboxes(mailboxes: MailMailbox[]): MailMailbox[] {
  return mailboxes.map(mailbox => ({ ...mailbox }))
}

export function createDefaultMailMailboxes(): MailMailbox[] {
  return [
    {
      id: 'mailbox-smirnov',
      userName: 'Смирнов А.',
      localPart: 'a.smirnov',
      domain: 'example-corp.ru',
      quotaGb: 25,
      quotaUnlimited: false,
      usedBytes: gbToBytes(4.2),
      status: 'active',
    },
    {
      id: 'mailbox-petrova',
      userName: 'Петрова Е.',
      localPart: 'e.petrova',
      domain: 'example-corp.ru',
      quotaGb: 10,
      quotaUnlimited: false,
      usedBytes: gbToBytes(8.6),
      status: 'active',
    },
    {
      id: 'mailbox-ivanov',
      userName: 'Иванов К.',
      localPart: 'k.ivanov',
      domain: 'example-corp.ru',
      quotaGb: 15,
      quotaUnlimited: false,
      usedBytes: gbToBytes(14.1),
      status: 'blocked',
    },
    {
      id: 'mailbox-kuznetsov',
      userName: 'Кузнецов Д.',
      localPart: 'd.kuznetsov',
      domain: 'mail.example-corp.ru',
      quotaGb: 50,
      quotaUnlimited: false,
      usedBytes: gbToBytes(12.3),
      status: 'active',
    },
    {
      id: 'mailbox-orlova',
      userName: 'Орлова М.',
      localPart: 'm.orlova',
      domain: 'example-corp.ru',
      quotaGb: 5,
      quotaUnlimited: false,
      usedBytes: gbToBytes(0.8),
      status: 'active',
    },
    {
      id: 'mailbox-support',
      userName: 'Служба поддержки',
      localPart: 'support',
      domain: 'example-corp.ru',
      quotaGb: 100,
      quotaUnlimited: true,
      usedBytes: gbToBytes(22),
      status: 'active',
    },
  ]
}

export function normalizePersistedMailboxes(value: unknown): MailMailbox[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const mailboxes: MailMailbox[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const row = item as Partial<MailMailbox>
    if (
      typeof row.id !== 'string'
      || typeof row.userName !== 'string'
      || typeof row.localPart !== 'string'
      || typeof row.domain !== 'string'
      || typeof row.quotaGb !== 'number'
      || typeof row.usedBytes !== 'number'
      || (row.status !== 'active' && row.status !== 'blocked')
    ) {
      continue
    }

    mailboxes.push({
      id: row.id,
      userName: row.userName,
      localPart: row.localPart,
      domain: row.domain,
      quotaGb: row.quotaGb,
      quotaUnlimited: row.quotaUnlimited === true,
      usedBytes: row.usedBytes,
      status: row.status,
    })
  }

  return mailboxes.length > 0 ? mailboxes : null
}

export function createMailMailboxFromPayload(
  id: string,
  payload: CreateMailMailboxPayload,
): MailMailbox {
  return {
    id,
    userName: payload.userName.trim(),
    localPart: payload.localPart.trim(),
    domain: payload.domain.trim(),
    quotaGb: payload.quotaUnlimited ? 0 : payload.quotaGb,
    quotaUnlimited: payload.quotaUnlimited,
    usedBytes: 0,
    status: payload.status,
  }
}
