<script setup lang="ts">
import { Bell, Bot, Mail, MessageSquare } from 'lucide-vue-next'
import { useNotificationChannels } from '@/app/composables/useNotificationChannels'
import type { NotificationChannelId } from '@lib/notifications/types'
import { Field, FieldDescription, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'

const {
  channels,
  ready,
  setChannelEnabled,
  updateChannelField,
} = useNotificationChannels()

const channelMeta: Record<
  NotificationChannelId,
  { title: string, description: string, icon: typeof Mail }
> = {
  email: {
    title: 'E-mail',
    description: 'Отправка уведомлений на корпоративную почту',
    icon: Mail,
  },
  sms: {
    title: 'SMS',
    description: 'SMS-сообщения на мобильные номера администраторов',
    icon: MessageSquare,
  },
  bell: {
    title: 'Колокольчик',
    description: 'In-app уведомления в интерфейсе IVA 360',
    icon: Bell,
  },
  ivaBot: {
    title: 'Бот iVA',
    description: 'Доставка через корпоративного бота iVA',
    icon: Bot,
  },
}

const channelOrder: NotificationChannelId[] = ['email', 'sms', 'bell', 'ivaBot']
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-base font-medium text-foreground">
        Каналы уведомлений
      </h2>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Настройка каналов уведомлений (e-mail, SMS, колокольчик, бот iVA)
      </p>
    </div>

    <div
      v-if="!ready"
      class="text-muted-foreground text-sm"
    >
      Загрузка настроек...
    </div>

    <div
      v-else
      class="flex flex-col gap-4"
    >
      <article
        v-for="channelId in channelOrder"
        :key="channelId"
        class="rounded-lg border border-border bg-muted/20 p-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex min-w-0 items-start gap-3">
            <span
              class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
              aria-hidden="true"
            >
              <component
                :is="channelMeta[channelId].icon"
                class="size-4"
              />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                {{ channelMeta[channelId].title }}
              </p>
              <p class="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                {{ channelMeta[channelId].description }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <Switch
              :id="`channel-${channelId}-enabled`"
              :model-value="channels[channelId].enabled"
              @update:model-value="setChannelEnabled(channelId, $event)"
            />
            <Label
              :for="`channel-${channelId}-enabled`"
              class="cursor-pointer text-xs font-normal text-muted-foreground"
            >
              {{ channels[channelId].enabled ? 'Вкл.' : 'Выкл.' }}
            </Label>
          </div>
        </div>

        <div
          v-if="channelId === 'email' && channels.email.enabled"
          class="mt-4 border-t border-border pt-4"
        >
          <Field class="gap-2">
            <FieldLabel for="notification-email-from">
              Адрес отправителя
            </FieldLabel>
            <Input
              id="notification-email-from"
              :model-value="channels.email.fromAddress"
              type="email"
              placeholder="noreply@example-corp.ru"
              autocomplete="off"
              @update:model-value="updateChannelField('email', 'fromAddress', String($event))"
            />
            <FieldDescription>
              Адрес, с которого будут отправляться e-mail оповещения
            </FieldDescription>
          </Field>
        </div>

        <div
          v-if="channelId === 'sms' && channels.sms.enabled"
          class="mt-4 border-t border-border pt-4"
        >
          <Field class="gap-2">
            <FieldLabel for="notification-sms-gateway">
              SMS-шлюз
            </FieldLabel>
            <Input
              id="notification-sms-gateway"
              :model-value="channels.sms.gatewayUrl"
              type="url"
              placeholder="https://sms.example-corp.ru/api"
              autocomplete="off"
              @update:model-value="updateChannelField('sms', 'gatewayUrl', String($event))"
            />
            <FieldDescription>
              URL API провайдера SMS для отправки сообщений
            </FieldDescription>
          </Field>
        </div>

        <div
          v-if="channelId === 'ivaBot' && channels.ivaBot.enabled"
          class="mt-4 border-t border-border pt-4"
        >
          <Field class="gap-2">
            <FieldLabel for="notification-iva-bot-webhook">
              Webhook бота
            </FieldLabel>
            <Input
              id="notification-iva-bot-webhook"
              :model-value="channels.ivaBot.botWebhookUrl"
              type="url"
              placeholder="https://bot.iva360.ru/hooks/notifications"
              autocomplete="off"
              @update:model-value="updateChannelField('ivaBot', 'botWebhookUrl', String($event))"
            />
            <FieldDescription>
              Endpoint для отправки событий в бот iVA
            </FieldDescription>
          </Field>
        </div>
      </article>
    </div>
  </div>
</template>
