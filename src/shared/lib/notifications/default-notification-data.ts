import type {
  NotificationChannelId,
  NotificationChannelsState,
  NotificationEvent,
} from './types'

export function createDefaultNotificationChannels(): NotificationChannelsState {
  return {
    email: {
      enabled: true,
      fromAddress: 'noreply@example-corp.ru',
      gatewayUrl: '',
      botWebhookUrl: '',
    },
    sms: {
      enabled: false,
      fromAddress: '',
      gatewayUrl: '',
      botWebhookUrl: '',
    },
    bell: {
      enabled: true,
      fromAddress: '',
      gatewayUrl: '',
      botWebhookUrl: '',
    },
    ivaBot: {
      enabled: true,
      fromAddress: '',
      gatewayUrl: '',
      botWebhookUrl: 'https://bot.iva360.ru/hooks/notifications',
    },
  }
}

export function cloneNotificationChannels(
  channels: NotificationChannelsState,
): NotificationChannelsState {
  return {
    email: { ...channels.email },
    sms: { ...channels.sms },
    bell: { ...channels.bell },
    ivaBot: { ...channels.ivaBot },
  }
}

export function createDefaultNotificationEvents(): NotificationEvent[] {
  return [
    {
      id: 'new-user',
      title: 'Новый пользователь',
      description: 'Принял приглашение',
      channels: { email: true, sms: false, bell: true, ivaBot: false },
    },
    {
      id: 'user-blocked',
      title: 'Пользователь заблокирован',
      description: 'Аккаунт заблокирован',
      channels: { email: true, sms: true, bell: true, ivaBot: true },
    },
    {
      id: 'quota-80',
      title: 'Квота > 80%',
      description: 'Критический уровень',
      channels: { email: true, sms: false, bell: false, ivaBot: false },
    },
    {
      id: 'licenses-low',
      title: 'Лицензии заканчиваются',
      description: 'Менее 10% свободных',
      channels: { email: true, sms: false, bell: true, ivaBot: false },
    },
    {
      id: 'subscription-expiring',
      title: 'Подписка истекает',
      description: 'До конца менее 30 дней',
      channels: { email: true, sms: false, bell: false, ivaBot: false },
    },
    {
      id: 'admin-new-ip',
      title: 'Вход с нового IP (admin)',
      description: 'Новое устройство',
      channels: { email: true, sms: true, bell: true, ivaBot: false },
    },
    {
      id: 'admin-2fa-disabled',
      title: '2FA отключена у admin',
      description: 'Снизился уровень безопасности',
      channels: { email: true, sms: true, bell: true, ivaBot: true },
    },
    {
      id: 'ldap-sync-error',
      title: 'LDAP ошибка синхронизации',
      description: 'Синхронизация завершилась с ошибкой',
      channels: { email: true, sms: false, bell: false, ivaBot: false },
    },
  ]
}

export function cloneNotificationEvents(
  events: NotificationEvent[],
): NotificationEvent[] {
  return events.map((event) => ({
    ...event,
    channels: { ...event.channels },
  }))
}

export function normalizePersistedChannels(
  value: unknown,
): NotificationChannelsState | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const defaults = createDefaultNotificationChannels()
  const source = value as Partial<NotificationChannelsState>
  const result = createDefaultNotificationChannels()

  for (const channelId of Object.keys(defaults) as NotificationChannelId[]) {
    const row = source[channelId]
    if (!row || typeof row !== 'object') {
      continue
    }

    const settings = row as Partial<NotificationChannelsState[NotificationChannelId]>
    result[channelId] = {
      ...defaults[channelId],
      enabled: typeof settings.enabled === 'boolean' ? settings.enabled : defaults[channelId].enabled,
      fromAddress:
        typeof settings.fromAddress === 'string'
          ? settings.fromAddress
          : defaults[channelId].fromAddress,
      gatewayUrl:
        typeof settings.gatewayUrl === 'string'
          ? settings.gatewayUrl
          : defaults[channelId].gatewayUrl,
      botWebhookUrl:
        typeof settings.botWebhookUrl === 'string'
          ? settings.botWebhookUrl
          : defaults[channelId].botWebhookUrl,
    }
  }

  return result
}

export function normalizePersistedEvents(value: unknown): NotificationEvent[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const defaults = createDefaultNotificationEvents()
  const defaultsById = new Map(defaults.map((event) => [event.id, event]))
  const result: NotificationEvent[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const row = item as Partial<NotificationEvent>
    if (typeof row.id !== 'string' || typeof row.title !== 'string') {
      continue
    }

    const fallback = defaultsById.get(row.id)
    const channels = row.channels

    result.push({
      id: row.id,
      title: row.title,
      description:
        typeof row.description === 'string'
          ? row.description
          : fallback?.description ?? '',
      channels: {
        email: typeof channels?.email === 'boolean' ? channels.email : fallback?.channels.email ?? false,
        sms: typeof channels?.sms === 'boolean' ? channels.sms : fallback?.channels.sms ?? false,
        bell: typeof channels?.bell === 'boolean' ? channels.bell : fallback?.channels.bell ?? false,
        ivaBot: typeof channels?.ivaBot === 'boolean' ? channels.ivaBot : fallback?.channels.ivaBot ?? false,
      },
    })
  }

  if (result.length === 0) {
    return null
  }

  for (const fallback of defaults) {
    if (!result.some((event) => event.id === fallback.id)) {
      result.push({ ...fallback, channels: { ...fallback.channels } })
    }
  }

  return result
}
