import boardsDefaultUrl from '@app/assets/img/icons/default/boards.svg?url'
import calendarDefaultUrl from '@app/assets/img/icons/default/calendar.svg?url'
import driveDefaultUrl from '@app/assets/img/icons/default/drive.svg?url'
import mailDefaultUrl from '@app/assets/img/icons/default/mail.svg?url'
import meetingsDefaultUrl from '@app/assets/img/icons/default/meetings.svg?url'
import messengerDefaultUrl from '@app/assets/img/icons/default/messenger.svg?url'
import onlineBroadcastsDefaultUrl from '@app/assets/img/icons/default/online-broadcasts.svg?url'
import roomsDefaultUrl from '@app/assets/img/icons/default/rooms.svg?url'
import webinarsDefaultUrl from '@app/assets/img/icons/default/webinars.svg?url'
import aiAssistantDefaultUrl from '@app/assets/img/icons/default/ai-assistent.svg?url'
import boardsUrl from '@app/assets/img/icons/solid/boards.svg?url'
import calendarUrl from '@app/assets/img/icons/solid/calendar.svg?url'
import driveUrl from '@app/assets/img/icons/solid/drive.svg?url'
import mailUrl from '@app/assets/img/icons/solid/mail.svg?url'
import meetingsUrl from '@app/assets/img/icons/solid/meetings.svg?url'
import messengerUrl from '@app/assets/img/icons/solid/messenger.svg?url'
import onlineBroadcastsUrl from '@app/assets/img/icons/solid/online-broadcasts.svg?url'
import roomsUrl from '@app/assets/img/icons/solid/rooms.svg?url'
import webinarsUrl from '@app/assets/img/icons/solid/webinars.svg?url'
import aiAssistantUrl from '@app/assets/img/icons/solid/ai-assistent.svg?url'

/** Ключи совпадают с именами файлов в `app/assets/img/icons/solid/` (без суффикса .svg). */
export const productIconUrls = {
  meetings: meetingsUrl,
  messenger: messengerUrl,
  drive: driveUrl,
  mail: mailUrl,
  boards: boardsUrl,
  calendar: calendarUrl,
  'online-broadcasts': onlineBroadcastsUrl,
  rooms: roomsUrl,
  webinars: webinarsUrl,
  'ai-assistent': aiAssistantUrl,
} as const

/** Те же ключи, файлы из `app/assets/img/icons/default/`. */
export const productIconUrlsDefault = {
  meetings: meetingsDefaultUrl,
  messenger: messengerDefaultUrl,
  drive: driveDefaultUrl,
  mail: mailDefaultUrl,
  boards: boardsDefaultUrl,
  calendar: calendarDefaultUrl,
  'online-broadcasts': onlineBroadcastsDefaultUrl,
  rooms: roomsDefaultUrl,
  webinars: webinarsDefaultUrl,
  'ai-assistent': aiAssistantDefaultUrl,
} as const

export type ProductIconKey = keyof typeof productIconUrls
