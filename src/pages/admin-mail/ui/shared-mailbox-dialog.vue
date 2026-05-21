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
import type { MailSharedMailbox, SharedMailboxPayload } from '@lib/mail/additional-settings-types'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  editingMailbox: MailSharedMailbox | null
}>()

const emit = defineEmits<{
  submit: [payload: SharedMailboxPayload]
}>()

const submitted = ref(false)

const form = reactive({
  name: '',
  address: '',
  accessCount: '3',
})

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!form.name.trim()) {
    next.name = 'Укажите название ящика'
  }

  if (!form.address.trim()) {
    next.address = 'Укажите адрес ящика'
  } else if (!form.address.includes('@')) {
    next.address = 'Укажите корректный e-mail'
  }

  const count = Number(form.accessCount)
  if (!form.accessCount.trim() || Number.isNaN(count) || count < 1) {
    next.accessCount = 'Укажите число пользователей с доступом от 1'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function accessLabel(count: number): string {
  return `${count} чел.`
}

function resetForm() {
  form.name = ''
  form.address = ''
  form.accessCount = '3'
  submitted.value = false
}

function fillFromMailbox(mailbox: MailSharedMailbox) {
  form.name = mailbox.name
  form.address = mailbox.address
  form.accessCount = String(mailbox.accessCount)
}

watch(
  () => [open.value, props.editingMailbox] as const,
  ([isOpen, mailbox]) => {
    if (!isOpen) {
      return
    }
    if (mailbox) {
      fillFromMailbox(mailbox)
    } else {
      resetForm()
    }
    submitted.value = false
  },
)

function onOpenChange(value: boolean) {
  open.value = value
  if (!value) {
    resetForm()
  }
}

function onSubmit() {
  submitted.value = true
  if (!isValid.value) {
    return
  }

  const accessCount = Number(form.accessCount)
  const payload: SharedMailboxPayload = {
    name: form.name.trim(),
    address: form.address.trim(),
    accessCount,
    accessLabel: accessLabel(accessCount),
  }

  emit('submit', payload)
  toast.success(props.editingMailbox ? 'Общий ящик обновлён' : 'Общий ящик создан', {
    description: payload.name,
  })
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
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex w-[calc(100vw-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <DialogHeader>
          <div class="min-w-0 flex-1 pr-2">
            <DialogTitle class="text-base font-medium text-foreground">
              {{ editingMailbox ? 'Редактировать общий ящик' : 'Создать общий ящик' }}
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Название, адрес и число пользователей с доступом к ящику.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="onSubmit"
        >
          <Field class="gap-2">
            <FieldLabel for="shared-mailbox-name">
              Ящик
            </FieldLabel>
            <Input
              id="shared-mailbox-name"
              v-model="form.name"
              type="text"
              class="h-10"
              placeholder="Поддержка"
              :aria-invalid="Boolean(errors.name)"
            />
            <FieldError :errors="errors.name ? [errors.name] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="shared-mailbox-address">
              Адрес
            </FieldLabel>
            <Input
              id="shared-mailbox-address"
              v-model="form.address"
              type="email"
              class="h-10 font-mono text-sm"
              placeholder="support@example-corp.ru"
              :aria-invalid="Boolean(errors.address)"
            />
            <FieldError :errors="errors.address ? [errors.address] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="shared-mailbox-access">
              Пользователей с доступом
            </FieldLabel>
            <Input
              id="shared-mailbox-access"
              v-model="form.accessCount"
              type="text"
              inputmode="numeric"
              class="h-10"
              placeholder="3"
              :aria-invalid="Boolean(errors.accessCount)"
            />
            <FieldError :errors="errors.accessCount ? [errors.accessCount] : undefined" />
          </Field>

          <div class="flex flex-wrap justify-end gap-2 pt-2">
            <DialogClose as-child>
              <Button
                type="button"
                variant="outline"
              >
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit">
              {{ editingMailbox ? 'Сохранить' : 'Создать' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
