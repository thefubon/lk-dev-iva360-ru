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
import type { CreateMailMailboxPayload, MailMailboxStatus } from '@lib/mail/types'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  domains: string[]
}>()

const emit = defineEmits<{
  submit: [payload: CreateMailMailboxPayload]
}>()

const submitted = ref(false)

const form = reactive({
  userName: '',
  localPart: '',
  domain: '',
  quotaGb: '10',
  quotaUnlimited: false,
  status: 'active' as MailMailboxStatus,
})

watch(
  () => props.domains,
  (domains) => {
    if (!form.domain && domains.length > 0) {
      form.domain = domains[0] ?? ''
    }
  },
  { immediate: true },
)

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!form.userName.trim()) {
    next.userName = 'Укажите имя пользователя'
  }

  if (!form.localPart.trim()) {
    next.localPart = 'Укажите локальную часть адреса'
  } else if (!/^[a-z0-9._-]+$/i.test(form.localPart.trim())) {
    next.localPart = 'Допустимы буквы, цифры, точка, дефис и подчёркивание'
  }

  if (!form.domain.trim()) {
    next.domain = 'Выберите домен'
  }

  if (!form.quotaUnlimited) {
    const quota = Number(form.quotaGb)
    if (!form.quotaGb.trim() || Number.isNaN(quota) || quota < 1 || quota > 1024) {
      next.quotaGb = 'Укажите квоту от 1 до 1024 ГБ'
    }
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function resetForm() {
  form.userName = ''
  form.localPart = ''
  form.domain = props.domains[0] ?? ''
  form.quotaGb = '10'
  form.quotaUnlimited = false
  form.status = 'active'
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

  const payload: CreateMailMailboxPayload = {
    userName: form.userName.trim(),
    localPart: form.localPart.trim(),
    domain: form.domain.trim(),
    quotaGb: form.quotaUnlimited ? 0 : Number(form.quotaGb),
    quotaUnlimited: form.quotaUnlimited,
    status: form.status,
  }

  emit('submit', payload)
  toast.success('Почтовый ящик создан', {
    description: `${payload.localPart}@${payload.domain}`,
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
              Создать почтовый ящик
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Укажите пользователя, адрес и квоту хранения.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="onSubmit"
        >
          <Field class="gap-2">
            <FieldLabel for="mailbox-user-name">
              Пользователь
            </FieldLabel>
            <Input
              id="mailbox-user-name"
              v-model="form.userName"
              type="text"
              class="h-10"
              autocomplete="off"
            />
            <FieldError v-if="errors.userName">
              {{ errors.userName }}
            </FieldError>
          </Field>

          <div class="grid gap-4 sm:grid-cols-2">
            <Field class="gap-2">
              <FieldLabel for="mailbox-local-part">
                Локальная часть
              </FieldLabel>
              <Input
                id="mailbox-local-part"
                v-model="form.localPart"
                type="text"
                class="h-10 font-mono text-sm"
                autocomplete="off"
              />
              <FieldError v-if="errors.localPart">
                {{ errors.localPart }}
              </FieldError>
            </Field>

            <Field class="gap-2">
              <FieldLabel for="mailbox-domain">
                Домен
              </FieldLabel>
              <Select v-model="form.domain">
                <SelectTrigger
                  id="mailbox-domain"
                  class="h-10 w-full"
                >
                  <SelectValue placeholder="Выберите домен" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem
                    v-for="domain in domains"
                    :key="domain"
                    :value="domain"
                  >
                    {{ domain }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldError v-if="errors.domain">
                {{ errors.domain }}
              </FieldError>
            </Field>
          </div>

          <div class="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                Без ограничения квоты
              </p>
            </div>
            <Switch
              id="mailbox-quota-unlimited"
              v-model="form.quotaUnlimited"
            />
          </div>

          <Field
            v-if="!form.quotaUnlimited"
            class="gap-2"
          >
            <FieldLabel for="mailbox-quota-gb">
              Квота (ГБ)
            </FieldLabel>
            <Input
              id="mailbox-quota-gb"
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

          <Field class="gap-2">
            <FieldLabel>
              Статус
            </FieldLabel>
            <RadioGroup
              v-model="form.status"
              class="flex flex-wrap gap-4"
            >
              <div class="flex items-center gap-2">
                <RadioGroupItem
                  id="mailbox-status-active"
                  value="active"
                />
                <Label for="mailbox-status-active">
                  Активен
                </Label>
              </div>
              <div class="flex items-center gap-2">
                <RadioGroupItem
                  id="mailbox-status-blocked"
                  value="blocked"
                />
                <Label for="mailbox-status-blocked">
                  Заблокирован
                </Label>
              </div>
            </RadioGroup>
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
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
