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
import {
  MAIL_DELEGATED_PERMISSION_LABELS,
  type DelegatedMailboxPayload,
  type MailDelegatedMailbox,
  type MailDelegatedPermission,
} from '@lib/mail/additional-settings-types'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  editingMailbox: MailDelegatedMailbox | null
}>()

const emit = defineEmits<{
  submit: [payload: DelegatedMailboxPayload]
}>()

const PERMISSION_OPTIONS: MailDelegatedPermission[] = ['read', 'send', 'manage']

const submitted = ref(false)

const form = reactive({
  ownerEmail: '',
  delegateEmail: '',
  permissions: {
    read: true,
    send: false,
    manage: false,
  } as Record<MailDelegatedPermission, boolean>,
})

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!form.ownerEmail.trim() || !form.ownerEmail.includes('@')) {
    next.ownerEmail = 'Укажите e-mail владельца'
  }

  if (!form.delegateEmail.trim() || !form.delegateEmail.includes('@')) {
    next.delegateEmail = 'Укажите e-mail делегата'
  }

  const selected = PERMISSION_OPTIONS.filter(permission => form.permissions[permission])
  if (selected.length === 0) {
    next.permissions = 'Выберите хотя бы одно право'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function resetForm() {
  form.ownerEmail = ''
  form.delegateEmail = ''
  form.permissions = { read: true, send: false, manage: false }
  submitted.value = false
}

function fillFromMailbox(mailbox: MailDelegatedMailbox) {
  form.ownerEmail = mailbox.ownerEmail
  form.delegateEmail = mailbox.delegateEmail
  for (const permission of PERMISSION_OPTIONS) {
    form.permissions[permission] = mailbox.permissions.includes(permission)
  }
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

  const payload: DelegatedMailboxPayload = {
    ownerEmail: form.ownerEmail.trim(),
    delegateEmail: form.delegateEmail.trim(),
    permissions: PERMISSION_OPTIONS.filter(permission => form.permissions[permission]),
  }

  emit('submit', payload)
  toast.success(props.editingMailbox ? 'Делегирование обновлено' : 'Делегирование добавлено')
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
              {{ editingMailbox ? 'Редактировать делегирование' : 'Добавить делегированный ящик' }}
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Владелец, делегат и права доступа к почтовому ящику.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="onSubmit"
        >
          <Field class="gap-2">
            <FieldLabel for="delegated-owner">
              Владелец
            </FieldLabel>
            <Input
              id="delegated-owner"
              v-model="form.ownerEmail"
              type="email"
              class="h-10 font-mono text-sm"
              placeholder="ceo@example-corp.ru"
              :aria-invalid="Boolean(errors.ownerEmail)"
            />
            <FieldError :errors="errors.ownerEmail ? [errors.ownerEmail] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="delegated-user">
              Делегат
            </FieldLabel>
            <Input
              id="delegated-user"
              v-model="form.delegateEmail"
              type="email"
              class="h-10 font-mono text-sm"
              placeholder="assistant@example-corp.ru"
              :aria-invalid="Boolean(errors.delegateEmail)"
            />
            <FieldError :errors="errors.delegateEmail ? [errors.delegateEmail] : undefined" />
          </Field>

          <fieldset class="flex flex-col gap-3">
            <legend class="text-sm font-medium text-foreground">
              Права
            </legend>
            <div
              v-for="permission in PERMISSION_OPTIONS"
              :key="permission"
              class="flex items-center gap-2"
            >
              <Checkbox
                :id="`delegated-perm-${permission}`"
                v-model:checked="form.permissions[permission]"
              />
              <Label :for="`delegated-perm-${permission}`">
                {{ MAIL_DELEGATED_PERMISSION_LABELS[permission] }}
              </Label>
            </div>
            <FieldError :errors="errors.permissions ? [errors.permissions] : undefined" />
          </fieldset>

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
              {{ editingMailbox ? 'Сохранить' : 'Добавить' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
