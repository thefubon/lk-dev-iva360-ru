<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useMailQueueStats } from '@/app/composables/useMailQueueStats'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

const { queue, servers, ready, refreshQueue } = useMailQueueStats()

function queueHealthVariant() {
  switch (queue.value.health) {
    case 'normal':
      return 'success'
    case 'warning':
      return 'secondary'
    case 'critical':
      return 'destructive'
    default:
      return 'outline'
  }
}

function onRefresh() {
  refreshQueue()
  toast.success('Данные очереди обновлены')
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section
        class="flex flex-col gap-4"
        aria-labelledby="mail-queue-heading"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-1">
            <h2
              id="mail-queue-heading"
              class="text-base font-medium text-foreground"
            >
              Очередь
            </h2>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Исходящие сообщения и задержки доставки
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="shrink-0 gap-1.5"
            :disabled="!ready"
            @click="onRefresh"
          >
            <RefreshCw
              class="size-4"
              aria-hidden="true"
            />
            Обновить
          </Button>
        </div>

        <div
          v-if="!ready"
          class="text-muted-foreground text-sm"
        >
          Загрузка...
        </div>

        <div
          v-else
          class="rounded-lg border border-border bg-white px-4 py-4"
        >
          <div class="mb-4 flex items-center gap-2">
            <span class="text-muted-foreground text-xs font-medium uppercase">
              Состояние
            </span>
            <Badge :variant="queueHealthVariant()">
              {{ queue.healthLabel }}
            </Badge>
          </div>

          <dl class="flex flex-col gap-3">
            <div class="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt class="text-sm text-foreground">
                В очереди
              </dt>
              <dd class="font-mono text-sm font-medium">
                {{ queue.inQueue }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt class="text-sm text-foreground">
                Отложенных
              </dt>
              <dd class="font-mono text-sm font-medium text-amber-600">
                {{ queue.deferred }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-sm text-foreground">
                Недоставленных
              </dt>
              <dd class="font-mono text-sm font-medium text-destructive">
                {{ queue.undelivered }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        class="flex flex-col gap-4"
        aria-labelledby="mail-servers-heading"
      >
        <div class="flex min-w-0 flex-col gap-1">
          <h2
            id="mail-servers-heading"
            class="text-base font-medium text-foreground"
          >
            Серверы
          </h2>
          <p class="text-muted-foreground text-sm leading-relaxed">
            Доступность почтовых сервисов
          </p>
        </div>

        <div
          v-if="!ready"
          class="text-muted-foreground text-sm"
        >
          Загрузка...
        </div>

        <ul
          v-else
          class="flex flex-col gap-2"
        >
          <li
            v-for="server in servers"
            :key="server.id"
            class="flex items-center justify-between gap-4 rounded-lg border border-border bg-white px-4 py-3"
          >
            <span class="text-sm font-medium text-foreground">
              {{ server.name }}
            </span>
            <Badge :variant="server.status === 'online' ? 'success' : 'destructive'">
              {{ server.status === 'online' ? 'Online' : 'Offline' }}
            </Badge>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
