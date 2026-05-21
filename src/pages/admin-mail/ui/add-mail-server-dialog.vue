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
import type { AddMailServerPayload } from '@lib/mail/types'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [payload: AddMailServerPayload]
}>()

const submitted = ref(false)

const form = reactive({
  serverHost: '',
  domainName: '',
  imapPort: '993',
  smtpPort: '587',
  description: '',
})

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!form.serverHost.trim()) {
    next.serverHost = 'Укажите имя или хост сервера'
  }

  if (!form.domainName.trim()) {
    next.domainName = 'Укажите доменное имя'
  } else if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(form.domainName.trim())) {
    next.domainName = 'Некорректный формат домена'
  }

  const imapPort = Number(form.imapPort)
  if (!form.imapPort.trim() || Number.isNaN(imapPort) || imapPort < 1 || imapPort > 65535) {
    next.imapPort = 'Укажите порт от 1 до 65535'
  }

  const smtpPort = Number(form.smtpPort)
  if (!form.smtpPort.trim() || Number.isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    next.smtpPort = 'Укажите порт от 1 до 65535'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function resetForm() {
  form.serverHost = ''
  form.domainName = ''
  form.imapPort = '993'
  form.smtpPort = '587'
  form.description = ''
  submitted.value = false
}

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

  const payload: AddMailServerPayload = {
    serverHost: form.serverHost.trim(),
    domainName: form.domainName.trim(),
    imapPort: Number(form.imapPort),
    smtpPort: Number(form.smtpPort),
    description: form.description.trim(),
  }

  emit('submit', payload)
  toast.success('Почтовый сервер добавлен', {
    description: `Домен ${payload.domainName} добавлен в список.`,
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
              Добавить почтовый сервер
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Укажите параметры нового сервера и домена для корпоративной почты.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="onSubmit"
        >
          <Field class="gap-2">
            <FieldLabel for="mail-server-host">
              Имя / хост сервера
            </FieldLabel>
            <Input
              id="mail-server-host"
              v-model="form.serverHost"
              type="text"
              variant="default"
              class="h-10 font-mono text-sm"
              placeholder="mail.example-corp.ru"
              autocomplete="off"
              :aria-invalid="Boolean(errors.serverHost)"
            />
            <FieldError :errors="errors.serverHost ? [errors.serverHost] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="mail-domain-name">
              Доменное имя
            </FieldLabel>
            <Input
              id="mail-domain-name"
              v-model="form.domainName"
              type="text"
              variant="default"
              class="h-10 font-mono text-sm"
              placeholder="example-corp.ru"
              autocomplete="off"
              :aria-invalid="Boolean(errors.domainName)"
            />
            <FieldError :errors="errors.domainName ? [errors.domainName] : undefined" />
          </Field>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field class="gap-2">
              <FieldLabel for="mail-server-imap-port">
                Порт IMAP
              </FieldLabel>
              <Input
                id="mail-server-imap-port"
                v-model="form.imapPort"
                type="text"
                inputmode="numeric"
                variant="default"
                class="h-10 font-mono text-sm"
                placeholder="993"
                autocomplete="off"
                :aria-invalid="Boolean(errors.imapPort)"
              />
              <FieldError :errors="errors.imapPort ? [errors.imapPort] : undefined" />
            </Field>

            <Field class="gap-2">
              <FieldLabel for="mail-server-smtp-port">
                Порт SMTP
              </FieldLabel>
              <Input
                id="mail-server-smtp-port"
                v-model="form.smtpPort"
                type="text"
                inputmode="numeric"
                variant="default"
                class="h-10 font-mono text-sm"
                placeholder="587"
                autocomplete="off"
                :aria-invalid="Boolean(errors.smtpPort)"
              />
              <FieldError :errors="errors.smtpPort ? [errors.smtpPort] : undefined" />
            </Field>
          </div>

          <Field class="gap-2">
            <FieldLabel for="mail-server-description">
              Описание
            </FieldLabel>
            <Textarea
              id="mail-server-description"
              v-model="form.description"
              class="min-h-20 resize-y"
              placeholder="Назначение сервера или комментарий для администраторов"
            />
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
              Добавить
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
