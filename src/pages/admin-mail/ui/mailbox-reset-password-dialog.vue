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
import { toast } from 'vue-sonner'
import type { MailMailbox } from '@lib/mail/types'
import { mailboxEmail } from '@lib/mail/mailbox-utils'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  mailboxes: MailMailbox[]
  mode: 'single' | 'bulk'
}>()

const emit = defineEmits<{
  confirm: []
}>()

const title = computed(() =>
  props.mode === 'bulk' ? 'Сбросить пароли' : 'Сбросить пароль',
)

const description = computed(() => {
  if (props.mode === 'bulk') {
    const count = props.mailboxes.length
    return `Будет выполнен сброс пароля для ${count} ${count === 1 ? 'ящика' : count < 5 ? 'ящиков' : 'ящиков'}. Пользователям потребуется задать новый пароль при следующем входе.`
  }

  const mailbox = props.mailboxes[0]
  if (!mailbox) {
    return ''
  }

  return `Сбросить пароль для ${mailbox.userName} (${mailboxEmail(mailbox)})? Пользователю потребуется задать новый пароль при следующем входе.`
})

function onOpenChange(value: boolean) {
  open.value = value
}

function onConfirm() {
  emit('confirm')

  if (props.mode === 'bulk') {
    toast.success('Пароли сброшены', {
      description: `Сброс выполнен для ${props.mailboxes.length} ящиков.`,
    })
  } else {
    const mailbox = props.mailboxes[0]
    toast.success('Пароль сброшен', {
      description: mailbox ? mailboxEmail(mailbox) : undefined,
    })
  }

  onOpenChange(false)
}
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="onOpenChange"
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
              {{ title }}
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              {{ description }}
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <div class="flex justify-end gap-2 px-4 py-4">
          <DialogClose as-child>
            <Button
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            @click="onConfirm"
          >
            Сбросить
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
