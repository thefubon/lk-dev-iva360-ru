<script setup lang="ts">
import { KeyRound, Package, Plus, Search, X } from 'lucide-vue-next'
import { useMailDomains } from '@/app/composables/useMailDomains'
import { useMailMailboxes } from '@/app/composables/useMailMailboxes'
import {
  formatMailboxQuota,
  formatMailboxUsed,
  mailboxEmail,
  mailboxUsagePercent,
} from '@lib/mail/mailbox-utils'
import type { CreateMailMailboxPayload, MailMailbox, UpdateMailMailboxQuotaPayload } from '@lib/mail/types'
import { cn } from '@lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Progress } from '@/shared/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import CreateMailboxDialog from './create-mailbox-dialog.vue'
import MailboxQuotaDialog from './mailbox-quota-dialog.vue'
import MailboxResetPasswordDialog from './mailbox-reset-password-dialog.vue'

const { mailboxes, ready, addMailbox, updateMailboxesQuota } = useMailMailboxes()
const { domains } = useMailDomains()

const searchQuery = ref('')
const selectedIds = ref<Record<string, boolean>>({})

const createDialogOpen = ref(false)
const quotaDialogOpen = ref(false)
const resetDialogOpen = ref(false)
const quotaDialogMode = ref<'single' | 'bulk'>('single')
const resetDialogMode = ref<'single' | 'bulk'>('single')
const quotaDialogMailboxes = ref<MailMailbox[]>([])
const resetDialogMailboxes = ref<MailMailbox[]>([])

const domainOptions = computed(() => {
  const names = domains.value.map(domain => domain.name)
  return names.length > 0 ? names : ['example-corp.ru']
})

const filteredMailboxes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return mailboxes.value
  }

  return mailboxes.value.filter((mailbox) => {
    const email = mailboxEmail(mailbox).toLowerCase()
    return (
      mailbox.userName.toLowerCase().includes(query)
      || mailbox.localPart.toLowerCase().includes(query)
      || email.includes(query)
    )
  })
})

const selectedMailboxIds = computed(() =>
  Object.entries(selectedIds.value)
    .filter(([, checked]) => checked)
    .map(([id]) => id),
)

const selectedCount = computed(() => selectedMailboxIds.value.length)

const selectedMailboxes = computed(() =>
  mailboxes.value.filter(mailbox => selectedMailboxIds.value.includes(mailbox.id)),
)

const showBulkBar = computed(() => selectedCount.value > 0)

const allVisibleSelected = computed(() => {
  const visible = filteredMailboxes.value
  return visible.length > 0 && visible.every(mailbox => selectedIds.value[mailbox.id])
})

const someVisibleSelected = computed(() =>
  filteredMailboxes.value.some(mailbox => selectedIds.value[mailbox.id]),
)

const pageSelectAllModel = computed({
  get(): boolean | 'indeterminate' {
    if (allVisibleSelected.value) {
      return true
    }
    if (someVisibleSelected.value) {
      return 'indeterminate'
    }
    return false
  },
  set(value: boolean | 'indeterminate') {
    const checked = value === true || value === 'indeterminate'
    const next = { ...selectedIds.value }
    for (const mailbox of filteredMailboxes.value) {
      if (checked) {
        next[mailbox.id] = true
      } else {
        delete next[mailbox.id]
      }
    }
    selectedIds.value = next
  },
})

function toggleRowSelection(mailboxId: string, checked: boolean) {
  const next = { ...selectedIds.value }
  if (checked) {
    next[mailboxId] = true
  } else {
    delete next[mailboxId]
  }
  selectedIds.value = next
}

function clearSelection() {
  selectedIds.value = {}
}

function openCreateDialog() {
  createDialogOpen.value = true
}

function onCreateMailbox(payload: CreateMailMailboxPayload) {
  addMailbox(payload)
}

function openQuotaDialog(mailboxesForDialog: MailMailbox[], mode: 'single' | 'bulk') {
  quotaDialogMailboxes.value = mailboxesForDialog
  quotaDialogMode.value = mode
  quotaDialogOpen.value = true
}

function openResetDialog(mailboxesForDialog: MailMailbox[], mode: 'single' | 'bulk') {
  resetDialogMailboxes.value = mailboxesForDialog
  resetDialogMode.value = mode
  resetDialogOpen.value = true
}

function onQuotaSubmit(payload: UpdateMailMailboxQuotaPayload) {
  const ids = quotaDialogMailboxes.value.map(mailbox => mailbox.id)
  updateMailboxesQuota(ids, payload)
  clearSelection()
}

function onResetConfirm() {
  clearSelection()
}

function statusBadgeVariant(status: MailMailbox['status']) {
  return status === 'active' ? 'success' : 'destructive'
}

function statusLabel(status: MailMailbox['status']) {
  return status === 'active' ? 'Активен' : 'Заблок.'
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <div class="relative flex flex-col gap-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="text-base font-medium text-foreground">
          Почтовые ящики
        </h2>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Список ящиков, квоты и сброс паролей пользователей
        </p>
      </div>
      <Button
        type="button"
        class="shrink-0 gap-1.5"
        @click="openCreateDialog"
      >
        <Plus
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        Создать
      </Button>
    </div>

    <div class="max-w-sm">
      <Input
        v-model="searchQuery"
        type="text"
        role="search"
        inputmode="search"
        placeholder="Поиск..."
        size="lg"
        class="h-10"
        autocomplete="off"
        :icon-right="searchQuery ? X : undefined"
        :icon-right-interactive="Boolean(searchQuery)"
        icon-right-aria-label="Очистить поиск"
        @icon-right-click="clearSearch"
      >
        <template #iconLeft>
          <Search
            class="size-4 text-foreground"
            aria-hidden="true"
          />
        </template>
      </Input>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="showBulkBar"
        class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5"
        role="toolbar"
        :aria-label="`Выбрано ящиков: ${selectedCount}`"
      >
        <div class="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="shrink-0"
            aria-label="Снять выделение"
            @click="clearSelection"
          >
            <X
              class="size-4"
              aria-hidden="true"
            />
          </Button>
          <span class="text-sm text-foreground">
            Выбрано:
            <span class="font-medium tabular-nums">{{ selectedCount }}</span>
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="gap-1.5"
            @click="openQuotaDialog(selectedMailboxes, 'bulk')"
          >
            <Package
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            Изменить квоту
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="gap-1.5"
            @click="openResetDialog(selectedMailboxes, 'bulk')"
          >
            <KeyRound
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            Сбросить пароль
          </Button>
        </div>
      </div>
    </Transition>

    <div
      v-if="!ready"
      class="text-muted-foreground text-sm"
    >
      Загрузка ящиков...
    </div>

    <div
      v-else
      class="overflow-hidden rounded-lg border border-border"
    >
      <Table>
        <TableHeader>
          <TableRow class="border-border hover:bg-transparent">
            <TableHead class="w-11 px-3 text-center">
              <Checkbox
                v-model="pageSelectAllModel"
                aria-label="Выбрать все"
              />
            </TableHead>
            <TableHead class="min-w-[10rem] text-xs font-medium text-muted-foreground uppercase">
              Пользователь
            </TableHead>
            <TableHead class="text-xs font-medium text-muted-foreground uppercase">
              Email
            </TableHead>
            <TableHead class="text-xs font-medium text-muted-foreground uppercase">
              Квота
            </TableHead>
            <TableHead class="min-w-[8rem] text-xs font-medium text-muted-foreground uppercase">
              Исп.
            </TableHead>
            <TableHead class="text-xs font-medium text-muted-foreground uppercase">
              Статус
            </TableHead>
            <TableHead class="w-[9rem] text-xs font-medium text-muted-foreground uppercase">
              <span class="sr-only">Действия</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-if="filteredMailboxes.length === 0"
            class="hover:bg-transparent"
          >
            <TableCell
              colspan="7"
              class="text-muted-foreground py-8 text-center text-sm"
            >
              Ящики не найдены
            </TableCell>
          </TableRow>
          <TableRow
            v-for="mailbox in filteredMailboxes"
            :key="mailbox.id"
            class="border-border hover:bg-muted/30"
          >
            <TableCell class="w-11 px-3 text-center">
              <Checkbox
                :model-value="!!selectedIds[mailbox.id]"
                :aria-label="`Выбрать ${mailbox.userName}`"
                @update:model-value="(v) => toggleRowSelection(mailbox.id, v === true)"
              />
            </TableCell>
            <TableCell class="min-w-0 py-3">
              <p class="text-sm font-semibold text-foreground">
                {{ mailbox.userName }}
              </p>
              <p class="text-muted-foreground text-xs">
                {{ mailboxEmail(mailbox) }}
              </p>
            </TableCell>
            <TableCell class="font-mono text-sm text-foreground">
              {{ mailbox.localPart }}
            </TableCell>
            <TableCell class="text-sm text-foreground whitespace-nowrap">
              {{ formatMailboxQuota(mailbox) }}
            </TableCell>
            <TableCell class="min-w-[8rem] py-3">
              <div class="flex min-w-[6rem] flex-col gap-1">
                <Progress
                  :model-value="mailboxUsagePercent(mailbox)"
                  class="h-1.5"
                  :indicator-class="cn(
                    mailboxUsagePercent(mailbox) >= 90 && 'bg-destructive',
                    mailboxUsagePercent(mailbox) >= 70
                      && mailboxUsagePercent(mailbox) < 90
                      && 'bg-amber-500',
                  )"
                />
                <span class="text-muted-foreground text-xs tabular-nums">
                  {{ formatMailboxUsed(mailbox.usedBytes) }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="statusBadgeVariant(mailbox.status)">
                {{ statusLabel(mailbox.status) }}
              </Badge>
            </TableCell>
            <TableCell class="py-3">
              <div class="flex flex-wrap items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                      aria-label="Сбросить пароль почтового ящика"
                      @click="openResetDialog([mailbox], 'single')"
                    >
                      <KeyRound
                        class="size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Сбросить пароль почтового ящика
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                      aria-label="Изменить квоту хранилища"
                      @click="openQuotaDialog([mailbox], 'single')"
                    >
                      <Package
                        class="size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Изменить квоту хранилища
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <CreateMailboxDialog
      v-model:open="createDialogOpen"
      :domains="domainOptions"
      @submit="onCreateMailbox"
    />

    <MailboxQuotaDialog
      v-model:open="quotaDialogOpen"
      :mailboxes="quotaDialogMailboxes"
      :mode="quotaDialogMode"
      @submit="onQuotaSubmit"
    />

    <MailboxResetPasswordDialog
      v-model:open="resetDialogOpen"
      :mailboxes="resetDialogMailboxes"
      :mode="resetDialogMode"
      @confirm="onResetConfirm"
    />
  </div>
</template>
