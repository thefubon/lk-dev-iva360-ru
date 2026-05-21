<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { Pencil, Plus, Settings2, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useMailCatchAll } from '@/app/composables/useMailCatchAll'
import { useMailDelegatedMailboxes } from '@/app/composables/useMailDelegatedMailboxes'
import { useMailMailingGroups } from '@/app/composables/useMailMailingGroups'
import { useMailSharedMailboxes } from '@/app/composables/useMailSharedMailboxes'
import {
  MAIL_DELEGATED_PERMISSION_LABELS,
  type MailDelegatedMailbox,
  type MailMailingGroup,
  type MailSharedMailbox,
} from '@lib/mail/additional-settings-types'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import CatchAllDialog from './catch-all-dialog.vue'
import DelegatedMailboxDialog from './delegated-mailbox-dialog.vue'
import MailingGroupDialog from './mailing-group-dialog.vue'
import SharedMailboxDialog from './shared-mailbox-dialog.vue'

type DeleteTarget =
  | { type: 'group', item: MailMailingGroup }
  | { type: 'shared', item: MailSharedMailbox }
  | { type: 'delegated', item: MailDelegatedMailbox }

const { groups, ready: groupsReady, addGroup, updateGroup, removeGroup } = useMailMailingGroups()
const {
  mailboxes: sharedMailboxes,
  ready: sharedReady,
  addMailbox,
  updateMailbox,
  removeMailbox: removeSharedMailbox,
} = useMailSharedMailboxes()
const { config: catchAllConfig, fullAddress, ready: catchAllReady, saveConfig } = useMailCatchAll()
const {
  mailboxes: delegatedMailboxes,
  ready: delegatedReady,
  addMailbox: addDelegated,
  updateMailbox: updateDelegated,
  removeMailbox: removeDelegatedMailbox,
} = useMailDelegatedMailboxes()

const mailingGroupDialogOpen = ref(false)
const sharedMailboxDialogOpen = ref(false)
const catchAllDialogOpen = ref(false)
const delegatedDialogOpen = ref(false)

const editingGroup = ref<MailMailingGroup | null>(null)
const editingShared = ref<MailSharedMailbox | null>(null)
const editingDelegated = ref<MailDelegatedMailbox | null>(null)

const deleteConfirmOpen = ref(false)
const deleteTarget = ref<DeleteTarget | null>(null)

const deleteConfirmTitle = computed(() => {
  if (!deleteTarget.value) {
    return ''
  }

  switch (deleteTarget.value.type) {
    case 'group':
      return 'Удалить группу?'
    case 'shared':
      return 'Удалить общий ящик?'
    case 'delegated':
      return 'Удалить делегирование?'
  }
})

const deleteConfirmDescription = computed(() => {
  if (!deleteTarget.value) {
    return ''
  }

  switch (deleteTarget.value.type) {
    case 'group':
      return `Группа «${deleteTarget.value.item.name}» (${deleteTarget.value.item.address}) будет удалена без возможности восстановления.`
    case 'shared':
      return `Общий ящик «${deleteTarget.value.item.name}» (${deleteTarget.value.item.address}) будет удалён без возможности восстановления.`
    case 'delegated':
      return `Делегирование ${deleteTarget.value.item.delegateEmail} → ${deleteTarget.value.item.ownerEmail} будет удалено без возможности восстановления.`
  }
})

function openCreateGroup() {
  editingGroup.value = null
  mailingGroupDialogOpen.value = true
}

function openEditGroup(group: MailMailingGroup) {
  editingGroup.value = group
  mailingGroupDialogOpen.value = true
}

function onGroupSubmit(payload: Parameters<typeof addGroup>[0]) {
  if (editingGroup.value) {
    updateGroup(editingGroup.value.id, payload)
  } else {
    addGroup(payload)
  }
}

function openCreateShared() {
  editingShared.value = null
  sharedMailboxDialogOpen.value = true
}

function openEditShared(mailbox: MailSharedMailbox) {
  editingShared.value = mailbox
  sharedMailboxDialogOpen.value = true
}

function onSharedSubmit(payload: Parameters<typeof addMailbox>[0]) {
  if (editingShared.value) {
    updateMailbox(editingShared.value.id, payload)
  } else {
    addMailbox(payload)
  }
}

function openCreateDelegated() {
  editingDelegated.value = null
  delegatedDialogOpen.value = true
}

function openEditDelegated(mailbox: MailDelegatedMailbox) {
  editingDelegated.value = mailbox
  delegatedDialogOpen.value = true
}

function onDelegatedSubmit(payload: Parameters<typeof addDelegated>[0]) {
  if (editingDelegated.value) {
    updateDelegated(editingDelegated.value.id, payload)
  } else {
    addDelegated(payload)
  }
}

function formatDelegatedPermissions(mailbox: MailDelegatedMailbox): string {
  return mailbox.permissions
    .map(permission => MAIL_DELEGATED_PERMISSION_LABELS[permission])
    .join(', ')
}

function openDeleteGroup(group: MailMailingGroup) {
  deleteTarget.value = { type: 'group', item: group }
  deleteConfirmOpen.value = true
}

function openDeleteShared(mailbox: MailSharedMailbox) {
  deleteTarget.value = { type: 'shared', item: mailbox }
  deleteConfirmOpen.value = true
}

function openDeleteDelegated(mailbox: MailDelegatedMailbox) {
  deleteTarget.value = { type: 'delegated', item: mailbox }
  deleteConfirmOpen.value = true
}

function cancelDelete() {
  deleteConfirmOpen.value = false
  deleteTarget.value = null
}

function confirmDelete() {
  const target = deleteTarget.value
  if (!target) {
    return
  }

  switch (target.type) {
    case 'group':
      removeGroup(target.item.id)
      toast.success('Группа удалена')
      break
    case 'shared':
      removeSharedMailbox(target.item.id)
      toast.success('Общий ящик удалён')
      break
    case 'delegated':
      removeDelegatedMailbox(target.item.id)
      toast.success('Делегирование удалено')
      break
  }

  cancelDelete()
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div
      v-if="!groupsReady || !sharedReady"
      class="text-muted-foreground text-sm"
    >
      Загрузка настроек...
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-6 lg:grid-cols-2"
    >
      <section
        class="flex flex-col gap-4"
        aria-labelledby="mailing-groups-heading"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-1">
            <h2
              id="mailing-groups-heading"
              class="text-base font-medium text-foreground"
            >
              Группы рассылок
            </h2>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Настройка групп рассылок
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            class="shrink-0 gap-1.5"
            @click="openCreateGroup"
          >
            <Plus
              class="size-4"
              aria-hidden="true"
            />
            Создать
          </Button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead class="text-muted-foreground text-xs font-medium uppercase">
                  Группа
                </TableHead>
                <TableHead class="text-muted-foreground text-xs font-medium uppercase">
                  Адрес
                </TableHead>
                <TableHead class="text-muted-foreground w-16 text-xs font-medium uppercase">
                  Уч.
                </TableHead>
                <TableHead class="text-muted-foreground w-24 text-right text-xs font-medium uppercase">
                  <span class="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="group in groups"
                :key="group.id"
              >
                <TableCell class="font-medium">
                  {{ group.name }}
                </TableCell>
                <TableCell class="font-mono text-sm text-muted-foreground">
                  {{ group.address }}
                </TableCell>
                <TableCell>
                  {{ group.membersCount }}
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-0.5">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                          aria-label="Редактировать группу рассылки"
                          @click="openEditGroup(group)"
                        >
                          <Pencil
                            class="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Редактировать группу рассылки
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                          aria-label="Удалить группу рассылки"
                          @click="openDeleteGroup(group)"
                        >
                          <Trash2
                            class="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Удалить группу рассылки
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <section
        class="flex flex-col gap-4"
        aria-labelledby="shared-mailboxes-heading"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-1">
            <h2
              id="shared-mailboxes-heading"
              class="text-base font-medium text-foreground"
            >
              Общие ящики
            </h2>
            <p class="text-muted-foreground text-sm leading-relaxed">
              Настройка общих ящиков
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            class="shrink-0 gap-1.5"
            @click="openCreateShared"
          >
            <Plus
              class="size-4"
              aria-hidden="true"
            />
            Создать
          </Button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border bg-white">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead class="text-muted-foreground text-xs font-medium uppercase">
                  Ящик
                </TableHead>
                <TableHead class="text-muted-foreground text-xs font-medium uppercase">
                  Адрес
                </TableHead>
                <TableHead class="text-muted-foreground text-xs font-medium uppercase">
                  Доступ
                </TableHead>
                <TableHead class="text-muted-foreground w-24 text-right text-xs font-medium uppercase">
                  <span class="sr-only">Действия</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="mailbox in sharedMailboxes"
                :key="mailbox.id"
              >
                <TableCell class="font-medium">
                  {{ mailbox.name }}
                </TableCell>
                <TableCell class="font-mono text-sm text-muted-foreground">
                  {{ mailbox.address }}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {{ mailbox.accessLabel }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-0.5">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                          aria-label="Редактировать общий ящик"
                          @click="openEditShared(mailbox)"
                        >
                          <Pencil
                            class="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Редактировать общий ящик
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                          aria-label="Удалить общий ящик"
                          @click="openDeleteShared(mailbox)"
                        >
                          <Trash2
                            class="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Удалить общий ящик
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>

    <section
      class="flex flex-col gap-4"
      aria-labelledby="catch-all-heading"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 flex-col gap-1">
          <h2
            id="catch-all-heading"
            class="text-base font-medium text-foreground"
          >
            Ящик для потерянных писем
          </h2>
          <p class="text-muted-foreground text-sm leading-relaxed">
            Настройка catch-all для несуществующих адресов домена
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="shrink-0 gap-1.5"
          :disabled="!catchAllReady"
          @click="catchAllDialogOpen = true"
        >
          <Settings2
            class="size-4"
            aria-hidden="true"
          />
          Настроить
        </Button>
      </div>

      <div class="rounded-lg border border-border bg-white px-4 py-4">
        <div
          v-if="!catchAllReady"
          class="text-muted-foreground text-sm"
        >
          Загрузка...
        </div>
        <dl
          v-else
          class="grid gap-3 sm:grid-cols-2"
        >
          <div class="flex flex-col gap-0.5">
            <dt class="text-muted-foreground text-xs font-medium uppercase">
              Статус
            </dt>
            <dd>
              <Badge :variant="catchAllConfig.enabled ? 'success' : 'outline'">
                {{ catchAllConfig.enabled ? 'Включено' : 'Отключено' }}
              </Badge>
            </dd>
          </div>
          <div class="flex flex-col gap-0.5">
            <dt class="text-muted-foreground text-xs font-medium uppercase">
              Адрес
            </dt>
            <dd class="font-mono text-sm text-foreground">
              {{ catchAllConfig.enabled ? fullAddress : '—' }}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section
      class="flex flex-col gap-4"
      aria-labelledby="delegated-heading"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 flex-col gap-1">
          <h2
            id="delegated-heading"
            class="text-base font-medium text-foreground"
          >
            Делегированные ящики
          </h2>
          <p class="text-muted-foreground text-sm leading-relaxed">
            Настройка делегированных ящиков
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          class="shrink-0 gap-1.5"
          :disabled="!delegatedReady"
          @click="openCreateDelegated"
        >
          <Plus
            class="size-4"
            aria-hidden="true"
          />
          Добавить
        </Button>
      </div>

      <div
        v-if="!delegatedReady"
        class="text-muted-foreground text-sm"
      >
        Загрузка...
      </div>

      <div
        v-else
        class="overflow-x-auto rounded-lg border border-border bg-white"
      >
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="text-muted-foreground text-xs font-medium uppercase">
                Владелец
              </TableHead>
              <TableHead class="text-muted-foreground text-xs font-medium uppercase">
                Делегат
              </TableHead>
              <TableHead class="text-muted-foreground text-xs font-medium uppercase">
                Права
              </TableHead>
              <TableHead class="text-muted-foreground w-24 text-right text-xs font-medium uppercase">
                <span class="sr-only">Действия</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="mailbox in delegatedMailboxes"
              :key="mailbox.id"
            >
              <TableCell class="font-mono text-sm">
                {{ mailbox.ownerEmail }}
              </TableCell>
              <TableCell class="font-mono text-sm text-muted-foreground">
                {{ mailbox.delegateEmail }}
              </TableCell>
              <TableCell class="text-sm">
                {{ formatDelegatedPermissions(mailbox) }}
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-0.5">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                        aria-label="Редактировать делегирование"
                        @click="openEditDelegated(mailbox)"
                      >
                        <Pencil
                          class="size-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Редактировать делегирование
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                        aria-label="Удалить делегирование"
                        @click="openDeleteDelegated(mailbox)"
                      >
                        <Trash2
                          class="size-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Удалить делегирование
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>

    <MailingGroupDialog
      v-model:open="mailingGroupDialogOpen"
      :editing-group="editingGroup"
      @submit="onGroupSubmit"
    />
    <SharedMailboxDialog
      v-model:open="sharedMailboxDialogOpen"
      :editing-mailbox="editingShared"
      @submit="onSharedSubmit"
    />
    <CatchAllDialog
      v-model:open="catchAllDialogOpen"
      :config="catchAllConfig"
      @submit="saveConfig"
    />
    <DelegatedMailboxDialog
      v-model:open="delegatedDialogOpen"
      :editing-mailbox="editingDelegated"
      @submit="onDelegatedSubmit"
    />

    <DialogRoot
      :open="deleteConfirmOpen"
      @update:open="(value) => { if (!value) cancelDelete() }"
    >
      <DialogPortal>
        <DialogOverlay
          class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/50"
        />
        <DialogContent
          class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex w-[calc(100vw-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
        >
          <DialogHeader>
            <div class="min-w-0 flex-1 pr-2">
              <DialogTitle class="text-base font-medium text-foreground">
                {{ deleteConfirmTitle }}
              </DialogTitle>
              <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
                {{ deleteConfirmDescription }}
              </DialogDescription>
            </div>
            <DialogCloseButton />
          </DialogHeader>

          <div class="flex justify-end gap-2 px-4 py-4">
            <DialogClose as-child>
              <Button
                type="button"
                variant="outline"
                @click="cancelDelete"
              >
                Отмена
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              @click="confirmDelete"
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
