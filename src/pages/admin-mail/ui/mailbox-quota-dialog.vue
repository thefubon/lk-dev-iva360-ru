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
import type { MailMailbox, UpdateMailMailboxQuotaPayload } from '@lib/mail/types'
import { mailboxEmail } from '@lib/mail/mailbox-utils'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  mailboxes: MailMailbox[]
  mode: 'single' | 'bulk'
}>()

const emit = defineEmits<{
  submit: [payload: UpdateMailMailboxQuotaPayload]
}>()

const submitted = ref(false)

const form = reactive({
  quotaGb: '10',
  quotaUnlimited: false,
})

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!form.quotaUnlimited) {
    const quota = Number(form.quotaGb)
    if (!form.quotaGb.trim() || Number.isNaN(quota) || quota < 1 || quota > 1024) {
      next.quotaGb = 'Укажите квоту от 1 до 1024 ГБ'
    }
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

const title = computed(() =>
  props.mode === 'bulk' ? 'Изменить квоту' : 'Квота почтового ящика',
)

const description = computed(() => {
  if (props.mode === 'bulk') {
    const count = props.mailboxes.length
    return `Новая квота будет применена к ${count} ${count === 1 ? 'ящику' : count < 5 ? 'ящикам' : 'ящикам'}.`
  }

  const mailbox = props.mailboxes[0]
  return mailbox ? mailboxEmail(mailbox) : ''
})

watch(
  () => [open.value, props.mailboxes] as const,
  ([isOpen, mailboxes]) => {
    if (!isOpen || mailboxes.length === 0) {
      return
    }

    const first = mailboxes[0]!
    form.quotaUnlimited = mailboxes.every(m => m.quotaUnlimited)
      ? true
      : first.quotaUnlimited
    form.quotaGb = String(first.quotaGb || 10)
    submitted.value = false
  },
)

function onOpenChange(value: boolean) {
  open.value = value
  if (!value) {
    submitted.value = false
  }
}

function onSubmit() {
  submitted.value = true
  if (!isValid.value) {
    return
  }

  const payload: UpdateMailMailboxQuotaPayload = {
    quotaGb: form.quotaUnlimited ? 0 : Number(form.quotaGb),
    quotaUnlimited: form.quotaUnlimited,
  }

  emit('submit', payload)

  if (props.mode === 'bulk') {
    toast.success('Квота обновлена', {
      description: `Изменения применены к ${props.mailboxes.length} ящикам.`,
    })
  } else {
    const mailbox = props.mailboxes[0]
    toast.success('Квота обновлена', {
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

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="onSubmit"
        >
          <div class="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                Без ограничения
              </p>
            </div>
            <Switch
              id="quota-dialog-unlimited"
              v-model="form.quotaUnlimited"
            />
          </div>

          <Field
            v-if="!form.quotaUnlimited"
            class="gap-2"
          >
            <FieldLabel for="quota-dialog-gb">
              Квота (ГБ)
            </FieldLabel>
            <Input
              id="quota-dialog-gb"
              v-model="form.quotaGb"
              type="number"
              min="1"
              max="1024"
              class="h-10"
            />
            <FieldError v-if="errors.quotaGb">
              {{ errors.quotaGb }}
            </FieldError>
          </Field>

          <div class="flex justify-end gap-2 pt-2">
            <DialogClose as-child>
              <Button
                type="button"
                variant="outline"
              >
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit">
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
