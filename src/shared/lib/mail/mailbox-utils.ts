import type { MailMailbox } from './types'

const GB = 1024 ** 3

export function mailboxEmail(mailbox: Pick<MailMailbox, 'localPart' | 'domain'>): string {
  return `${mailbox.localPart}@${mailbox.domain}`
}

export function formatMailboxQuota(mailbox: Pick<MailMailbox, 'quotaGb' | 'quotaUnlimited'>): string {
  if (mailbox.quotaUnlimited) {
    return 'Без лимита'
  }
  return `${mailbox.quotaGb} ГБ`
}

export function formatMailboxUsed(bytes: number): string {
  if (bytes >= GB) {
    const gb = bytes / GB
    return gb >= 10 ? `${Math.round(gb)}G` : `${gb.toFixed(1)}G`
  }

  const mb = bytes / (1024 ** 2)
  if (mb >= 1) {
    return mb >= 100 ? `${Math.round(mb)}M` : `${mb.toFixed(1)}M`
  }

  return '0'
}

export function mailboxUsagePercent(mailbox: MailMailbox): number {
  if (mailbox.quotaUnlimited || mailbox.quotaGb <= 0) {
    return 0
  }

  const quotaBytes = mailbox.quotaGb * GB
  return Math.min(100, Math.round((mailbox.usedBytes / quotaBytes) * 100))
}

export function gbToBytes(gb: number): number {
  return Math.round(gb * GB)
}
