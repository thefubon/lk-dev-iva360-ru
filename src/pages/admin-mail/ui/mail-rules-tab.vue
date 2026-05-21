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
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useMailRules } from '@/app/composables/useMailRules'
import type { MailRule } from '@lib/mail/additional-settings-types'
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
import MailRuleDialog from './mail-rule-dialog.vue'

const { rules, ready, addRule, updateRule, removeRule } = useMailRules()

const dialogOpen = ref(false)
const editingRule = ref<MailRule | null>(null)

const deleteConfirmOpen = ref(false)
const deletingRule = ref<MailRule | null>(null)

function openCreate() {
  editingRule.value = null
  dialogOpen.value = true
}

function openEdit(rule: MailRule) {
  editingRule.value = rule
  dialogOpen.value = true
}

function onSubmit(payload: Parameters<typeof addRule>[0]) {
  if (editingRule.value) {
    updateRule(editingRule.value.id, payload)
  } else {
    addRule(payload)
  }
}

function openDelete(rule: MailRule) {
  deletingRule.value = rule
  deleteConfirmOpen.value = true
}

function cancelDelete() {
  deleteConfirmOpen.value = false
  deletingRule.value = null
}

function confirmDelete() {
  if (!deletingRule.value) {
    return
  }

  removeRule(deletingRule.value.id)
  toast.success('Правило удалено')
  cancelDelete()
}

function actionBadgeVariant(rule: MailRule) {
  return rule.action === 'reject' ? 'destructive' : 'secondary'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="text-base font-medium text-foreground">
          Правила обработки почты
        </h2>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Фильтрация и действия при получении писем
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        class="shrink-0 gap-1.5"
        :disabled="!ready"
        @click="openCreate"
      >
        <Plus
          class="size-4"
          aria-hidden="true"
        />
        Правило
      </Button>
    </div>

    <div
      v-if="!ready"
      class="text-muted-foreground text-sm"
    >
      Загрузка правил...
    </div>

    <div
      v-else
      class="overflow-x-auto rounded-lg border border-border bg-white"
    >
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="text-muted-foreground w-20 text-xs font-medium uppercase">
              Приор.
            </TableHead>
            <TableHead class="text-muted-foreground text-xs font-medium uppercase">
              Условие
            </TableHead>
            <TableHead class="text-muted-foreground text-xs font-medium uppercase">
              Действие
            </TableHead>
            <TableHead class="text-muted-foreground text-xs font-medium uppercase">
              Статус
            </TableHead>
            <TableHead class="text-muted-foreground w-24 text-right text-xs font-medium uppercase">
              <span class="sr-only">Действия</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="rule in rules"
            :key="rule.id"
          >
            <TableCell class="font-mono text-sm">
              {{ rule.priority }}
            </TableCell>
            <TableCell class="font-mono text-sm">
              {{ rule.condition }}
            </TableCell>
            <TableCell>
              <Badge :variant="actionBadgeVariant(rule)">
                {{ rule.actionLabel }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="rule.status === 'enabled' ? 'success' : 'outline'">
                {{ rule.status === 'enabled' ? 'Вкл.' : 'Выкл.' }}
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
                      aria-label="Редактировать правило"
                      @click="openEdit(rule)"
                    >
                      <Pencil
                        class="size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Редактировать правило
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      class="shrink-0 text-muted-foreground hover:bg-muted/50 hover:text-primary"
                      aria-label="Удалить правило"
                      @click="openDelete(rule)"
                    >
                      <Trash2
                        class="size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Удалить правило
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <MailRuleDialog
      v-model:open="dialogOpen"
      :editing-rule="editingRule"
      @submit="onSubmit"
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
                Удалить правило?
              </DialogTitle>
              <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
                <template v-if="deletingRule">
                  Правило «{{ deletingRule.condition }}» будет удалено без возможности восстановления.
                </template>
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
