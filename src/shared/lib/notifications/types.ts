export const NOTIFICATION_CHANNELS_STORAGE_KEY = 'iva360:notifications:channels'
export const NOTIFICATION_EVENTS_STORAGE_KEY = 'iva360:notifications:events'

export const NOTIFICATION_TABS = ['channels', 'list'] as const
export type NotificationTab = (typeof NOTIFICATION_TABS)[number]

export const NOTIFICATION_TAB_LABELS: Record<NotificationTab, string> = {
  channels: 'Каналы уведомлений',
  list: 'Уведомления',
}

export type NotificationChannelId = 'email' | 'sms' | 'bell' | 'ivaBot'

export interface NotificationChannelSettings {
  enabled: boolean
  fromAddress: string
  gatewayUrl: string
  botWebhookUrl: string
}

export type NotificationChannelsState = Record<
  NotificationChannelId,
  NotificationChannelSettings
>

export interface NotificationChannelsPersistedState {
  channels: NotificationChannelsState
  savedAt: string
}

export interface NotificationEventChannels {
  email: boolean
  sms: boolean
  bell: boolean
  ivaBot: boolean
}

export interface NotificationEvent {
  id: string
  title: string
  description: string
  channels: NotificationEventChannels
}

export interface NotificationEventsPersistedState {
  events: NotificationEvent[]
  savedAt: string
}

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannelId, string> = {
  email: 'E-mail',
  sms: 'SMS',
  bell: 'Колокольчик',
  ivaBot: 'Бот iVA',
}

export const NOTIFICATION_CHANNEL_ORDER: NotificationChannelId[] = [
  'email',
  'sms',
  'bell',
  'ivaBot',
]
