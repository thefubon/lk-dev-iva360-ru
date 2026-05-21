export const MAIL_ADDITIONAL_SECTIONS = ['groups', 'rules', 'queue', 'caldav'] as const
export type MailAdditionalSection = (typeof MAIL_ADDITIONAL_SECTIONS)[number]

export const MAIL_ADDITIONAL_SECTION_LABELS: Record<MailAdditionalSection, string> = {
  groups: 'Группы и ящики',
  rules: 'Правила',
  queue: 'Очередь и серверы',
  caldav: 'Синхронизация',
}

export const MAIL_ADDITIONAL_SECTION_DESCRIPTIONS: Record<MailAdditionalSection, string> = {
  groups: 'Группы рассылки, общие и делегированные ящики, catch-all для потерянных писем.',
  rules: 'Правила обработки входящей и исходящей почты по приоритету.',
  queue: 'Состояние очереди исходящих и доступность почтовых сервисов.',
  caldav: 'CalDAV, CardDAV и Exchange ActiveSync для мобильных клиентов.',
}

export const DEFAULT_MAIL_ADDITIONAL_SECTION: MailAdditionalSection = 'groups'

export function isMailAdditionalSection(value: unknown): value is MailAdditionalSection {
  return typeof value === 'string'
    && MAIL_ADDITIONAL_SECTIONS.includes(value as MailAdditionalSection)
}

export function sectionFromQuery(querySection: unknown): MailAdditionalSection {
  return isMailAdditionalSection(querySection) ? querySection : DEFAULT_MAIL_ADDITIONAL_SECTION
}

export function mailAdditionalSettingsPath(section?: MailAdditionalSection): string {
  if (!section || section === DEFAULT_MAIL_ADDITIONAL_SECTION) {
    return '/admin/mail/settings'
  }
  return `/admin/mail/settings?section=${section}`
}
