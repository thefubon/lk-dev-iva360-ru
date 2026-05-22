import boardsAccent from '@app/assets/img/icons/accent/boards.svg?raw'
import calendarAccent from '@app/assets/img/icons/accent/calendar.svg?raw'
import driveAccent from '@app/assets/img/icons/accent/drive-new.svg?raw'
import mailAccent from '@app/assets/img/icons/accent/mail.svg?raw'
import meetingsAccent from '@app/assets/img/icons/accent/meetings.svg?raw'
import messengerAccent from '@app/assets/img/icons/accent/messenger.svg?raw'
import onlineBroadcastsAccent from '@app/assets/img/icons/accent/online-broadcasts.svg?raw'
import roomsAccent from '@app/assets/img/icons/accent/rooms.svg?raw'
import webinarsAccent from '@app/assets/img/icons/accent/webinars.svg?raw'
import aiAssistantAccent from '@app/assets/img/icons/accent/ai-assistent.svg?raw'
import boardsDefault from '@app/assets/img/icons/default/boards.svg?raw'
import calendarDefault from '@app/assets/img/icons/default/calendar.svg?raw'
import driveDefault from '@app/assets/img/icons/default/drive-new.svg?raw'
import mailDefault from '@app/assets/img/icons/default/mail.svg?raw'
import meetingsDefault from '@app/assets/img/icons/default/meetings.svg?raw'
import messengerDefault from '@app/assets/img/icons/default/messenger.svg?raw'
import onlineBroadcastsDefault from '@app/assets/img/icons/default/online-broadcasts.svg?raw'
import roomsDefault from '@app/assets/img/icons/default/rooms.svg?raw'
import webinarsDefault from '@app/assets/img/icons/default/webinars.svg?raw'
import aiAssistantDefault from '@app/assets/img/icons/default/ai-assistent.svg?raw'
import boardsSolid from '@app/assets/img/icons/solid/boards.svg?raw'
import calendarSolid from '@app/assets/img/icons/solid/calendar.svg?raw'
import driveSolid from '@app/assets/img/icons/solid/drive-new.svg?raw'
import mailSolid from '@app/assets/img/icons/solid/mail.svg?raw'
import meetingsSolid from '@app/assets/img/icons/solid/meetings.svg?raw'
import messengerSolid from '@app/assets/img/icons/solid/messenger.svg?raw'
import onlineBroadcastsSolid from '@app/assets/img/icons/solid/online-broadcasts.svg?raw'
import roomsSolid from '@app/assets/img/icons/solid/rooms.svg?raw'
import webinarsSolid from '@app/assets/img/icons/solid/webinars.svg?raw'
import aiAssistantSolid from '@app/assets/img/icons/solid/ai-assistent.svg?raw'

/** Ключи совпадают с именами файлов в `app/assets/img/icons/solid/` (без суффикса .svg). */
const productIconMap = {
  meetings: meetingsSolid,
  messenger: messengerSolid,
  drive: driveSolid,
  mail: mailSolid,
  boards: boardsSolid,
  calendar: calendarSolid,
  'online-broadcasts': onlineBroadcastsSolid,
  rooms: roomsSolid,
  webinars: webinarsSolid,
  'ai-assistent': aiAssistantSolid,
} as const

const productIconMapDefault = {
  meetings: meetingsDefault,
  messenger: messengerDefault,
  drive: driveDefault,
  mail: mailDefault,
  boards: boardsDefault,
  calendar: calendarDefault,
  'online-broadcasts': onlineBroadcastsDefault,
  rooms: roomsDefault,
  webinars: webinarsDefault,
  'ai-assistent': aiAssistantDefault,
} as const

const productIconMapAccent = {
  meetings: meetingsAccent,
  messenger: messengerAccent,
  drive: driveAccent,
  mail: mailAccent,
  boards: boardsAccent,
  calendar: calendarAccent,
  'online-broadcasts': onlineBroadcastsAccent,
  rooms: roomsAccent,
  webinars: webinarsAccent,
  'ai-assistent': aiAssistantAccent,
} as const

export type ProductIconKey = keyof typeof productIconMap
export type ProductIconVariant = 'solid' | 'default' | 'accent'

export const productIcons = {
  solid: productIconMap,
  default: productIconMapDefault,
  accent: productIconMapAccent,
} as const

/** Цвет глифа для solid/default — `text-*-primary`. */
export const productIconGlyphClass: Record<ProductIconKey, string> = {
  meetings: 'text-meetings-primary',
  messenger: 'text-messenger-primary',
  drive: 'text-drive-primary',
  mail: 'text-mail-primary',
  boards: 'text-board-primary',
  calendar: 'text-mail-primary',
  'online-broadcasts': 'text-broadcasts-primary',
  rooms: 'text-rooms-primary',
  webinars: 'text-webinars-primary',
  'ai-assistent': 'text-ai-primary',
}

/** Фон плитки solid — `bg-*-secondary`. */
export const productIconSolidTileClass: Record<ProductIconKey, string> = {
  meetings: 'bg-meetings-secondary',
  messenger: 'bg-messenger-secondary',
  drive: 'bg-drive-secondary',
  mail: 'bg-mail-secondary',
  boards: 'bg-board-secondary',
  calendar: 'bg-mail-secondary',
  'online-broadcasts': 'bg-broadcasts-secondary',
  rooms: 'bg-rooms-secondary',
  webinars: 'bg-webinars-secondary',
  'ai-assistent': 'bg-ai-secondary',
}

/** Плитка accent — primary фон, secondary глиф. */
export const productIconAccentTileClass: Record<ProductIconKey, string> = {
  meetings: 'bg-meetings-primary text-meetings-secondary',
  messenger: 'bg-messenger-primary text-messenger-secondary',
  drive: 'bg-drive-primary text-drive-secondary',
  mail: 'bg-mail-primary text-mail-secondary',
  boards: 'bg-board-primary text-board-secondary',
  calendar: 'bg-mail-primary text-mail-secondary',
  'online-broadcasts': 'bg-broadcasts-primary text-broadcasts-secondary',
  rooms: 'bg-rooms-primary text-rooms-secondary',
  webinars: 'bg-webinars-primary text-webinars-secondary',
  'ai-assistent': 'bg-ai-primary text-ai-secondary',
}
