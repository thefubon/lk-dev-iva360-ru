<script setup lang="ts">
import { Play } from 'lucide-vue-next'
import { useNotificationChannels } from '@/app/composables/useNotificationChannels'
import { useNotificationEvents } from '@/app/composables/useNotificationEvents'
import {
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_CHANNEL_ORDER,
  type NotificationChannelId,
} from '@lib/notifications/types'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import NotificationsTestDialog from './notifications-test-dialog.vue'

const { enabledChannelIds } = useNotificationChannels()
const {
  events,
  ready,
  testDialogOpen,
  setEventChannel,
  openTestDialog,
} = useNotificationEvents()

function isChannelToggleDisabled(channelId: NotificationChannelId): boolean {
  return !enabledChannelIds.value.includes(channelId)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex flex-col gap-1">
        <h2 class="text-base font-medium text-foreground">
          Настройки оповещений
        </h2>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Настройка самих уведомлений (отправлять или не отправлять)
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        class="shrink-0"
        @click="openTestDialog"
      >
        <Play
          class="size-4"
          aria-hidden="true"
        />
        Тест
      </Button>
    </div>

    <div
      v-if="!ready"
      class="text-muted-foreground text-sm"
    >
      Загрузка настроек...
    </div>

    <div
      v-else
      class="overflow-x-auto"
    >
      <div class="min-w-[720px]">
        <div
          class="grid grid-cols-[minmax(220px,1fr)_repeat(4,88px)] items-end gap-x-3 border-b border-border pb-2"
          role="row"
        >
          <div
            class="text-muted-foreground text-xs font-medium"
            role="columnheader"
          >
            Событие
          </div>
          <div
            v-for="channelId in NOTIFICATION_CHANNEL_ORDER"
            :key="`header-${channelId}`"
            class="text-muted-foreground text-center text-xs font-medium"
            role="columnheader"
          >
            {{ NOTIFICATION_CHANNEL_LABELS[channelId] }}
          </div>
        </div>

        <div
          v-for="event in events"
          :key="event.id"
          class="grid grid-cols-[minmax(220px,1fr)_repeat(4,88px)] items-center gap-x-3 border-b border-border py-3 last:border-b-0"
          role="row"
        >
          <div
            class="min-w-0 pr-2"
            role="cell"
          >
            <p class="text-sm font-medium text-foreground">
              {{ event.title }}
            </p>
            <p class="text-muted-foreground mt-0.5 text-xs leading-relaxed">
              {{ event.description }}
            </p>
          </div>

          <div
            v-for="channelId in NOTIFICATION_CHANNEL_ORDER"
            :key="`${event.id}-${channelId}`"
            class="flex flex-col items-center gap-1"
            role="cell"
          >
            <Switch
              :id="`${event.id}-${channelId}`"
              :model-value="event.channels[channelId]"
              :disabled="isChannelToggleDisabled(channelId)"
              @update:model-value="setEventChannel(event.id, channelId, $event)"
            />
            <Label
              :for="`${event.id}-${channelId}`"
              class="sr-only"
            >
              {{ event.title }} — {{ NOTIFICATION_CHANNEL_LABELS[channelId] }}
            </Label>
          </div>
        </div>
      </div>
    </div>

    <p class="text-muted-foreground text-xs leading-relaxed">
      Переключатели недоступны для каналов, отключённых на вкладке
      «Каналы уведомлений».
    </p>

    <NotificationsTestDialog
      v-model:open="testDialogOpen"
      :enabled-channels="enabledChannelIds"
    />
  </div>
</template>
