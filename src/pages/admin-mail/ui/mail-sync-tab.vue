<script setup lang="ts">
import { toast } from 'vue-sonner'
import { useMailSyncSettings } from '@/app/composables/useMailSyncSettings'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'

const { settings, ready, setSetting } = useMailSyncSettings()

const SYNC_TOGGLES = [
  {
    key: 'caldavCalendars' as const,
    id: 'sync-caldav',
    title: 'Календари CalDAV',
    description: 'Синхронизация календарей с клиентами CalDAV',
  },
  {
    key: 'carddavGal' as const,
    id: 'sync-carddav',
    title: 'CardDAV GAL',
    description: 'Глобальный адресной книги через CardDAV',
  },
  {
    key: 'activeSyncEas' as const,
    id: 'sync-eas',
    title: 'ActiveSync EAS',
    description: 'Exchange ActiveSync для мобильных устройств',
  },
  {
    key: 'easRequirePin' as const,
    id: 'sync-eas-pin',
    title: 'Требовать PIN для EAS',
    description: 'Обязательный PIN-код на устройствах с ActiveSync',
  },
]

function onToggle(key: typeof SYNC_TOGGLES[number]['key'], value: boolean) {
  setSetting(key, value)
  const item = SYNC_TOGGLES.find(toggle => toggle.key === key)
  toast.success('Настройка сохранена', {
    description: item ? `${item.title}: ${value ? 'включено' : 'выключено'}` : undefined,
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-base font-medium text-foreground">
        CalDAV / CardDAV / ActiveSync
      </h2>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Синхронизация календарей, контактов и мобильной почты
      </p>
    </div>

    <div
      v-if="!ready"
      class="text-muted-foreground text-sm"
    >
      Загрузка настроек...
    </div>

    <ul
      v-else
      class="flex flex-col gap-0 overflow-hidden rounded-lg border border-border bg-white divide-y divide-border"
    >
      <li
        v-for="item in SYNC_TOGGLES"
        :key="item.key"
        class="flex items-center justify-between gap-4 px-4 py-4"
      >
        <div class="flex min-w-0 flex-col gap-0.5">
          <Label
            :for="item.id"
            class="text-sm font-medium text-foreground"
          >
            {{ item.title }}
          </Label>
          <p class="text-muted-foreground text-xs leading-relaxed">
            {{ item.description }}
          </p>
        </div>
        <Switch
          :id="item.id"
          :checked="settings[item.key]"
          :disabled="item.key === 'easRequirePin' && !settings.activeSyncEas"
          @update:checked="onToggle(item.key, $event)"
        />
      </li>
    </ul>
  </div>
</template>
