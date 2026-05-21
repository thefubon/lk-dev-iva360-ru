<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'
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
import { CompanySearchCombobox } from '@/features/company-search'
import type { ChangeOrganizationRequestPayload, SelectedCompany } from '@/shared/lib/dadata/types'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [payload: ChangeOrganizationRequestPayload]
}>()

const selectedCompany = ref<SelectedCompany | null>(null)
const email = ref('')
const reason = ref('')
const confirmed = ref(false)
const submitted = ref(false)
const comboboxSessionKey = ref(0)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!selectedCompany.value?.name.trim()) {
    next.company = 'Выберите организацию из подсказок DaData'
  }

  const trimmedEmail = email.value.trim()
  if (!trimmedEmail) {
    next.email = 'Укажите email нового владельца'
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    next.email = 'Введите корректный email'
  }

  if (reason.value.trim().length < 3) {
    next.reason = 'Укажите причину смены (минимум 3 символа)'
  }

  if (!confirmed.value) {
    next.confirmed = 'Подтвердите смену организации'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function resetForm() {
  selectedCompany.value = null
  email.value = ''
  reason.value = ''
  confirmed.value = false
  submitted.value = false
  comboboxSessionKey.value += 1
}

watch(open, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

watch(selectedCompany, (company) => {
  if (company?.email) {
    email.value = company.email
  }
})

function handleCancel() {
  open.value = false
}

function handleSubmit() {
  submitted.value = true

  if (!isValid.value || !selectedCompany.value) {
    return
  }

  const payload: ChangeOrganizationRequestPayload = {
    company: selectedCompany.value,
    ownerEmail: email.value.trim(),
    reason: reason.value.trim(),
  }

  emit('submit', payload)
  open.value = false
  toast.success('Запрос на смену организации отправлен', {
    description: 'Данные организации обновлены из ЕГРЮЛ.',
  })
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/50"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex min-h-[min(70dvh,520px)] max-h-[min(90dvh,800px)] w-[calc(100vw-2rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <div class="flex shrink-0 items-start justify-between border-b border-border px-4 py-3">
          <DialogTitle class="text-base font-medium text-foreground">
            Смена организации
          </DialogTitle>
          <DialogDescription class="sr-only">
            Форма запроса на смену организации с подтверждением и данными из ЕГРЮЛ.
          </DialogDescription>
          <DialogClose as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 rounded-full bg-muted text-foreground hover:bg-muted/80"
              aria-label="Закрыть"
              @click="handleCancel"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <div
          data-modal-body
          class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4"
        >
          <div
            role="status"
            class="flex gap-2 rounded-lg border border-warning/25 bg-warning-secondary px-3 py-2.5 text-sm leading-snug text-warning"
          >
            <AlertTriangle
              class="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>Данные организации будут заменены данными из ЕГРЮЛ</span>
          </div>

          <Field class="relative z-20 gap-2">
            <FieldLabel for="change-organization-company">
              Новая организация
            </FieldLabel>
            <CompanySearchCombobox
              :key="comboboxSessionKey"
              id="change-organization-company"
              v-model="selectedCompany"
              in-modal
              placeholder="Введите название или ИНН компании"
            />
            <FieldError :errors="errors.company ? [errors.company] : undefined" />
          </Field>

          <Field
            v-if="selectedCompany?.ownerFullName"
            class="gap-2"
          >
            <FieldLabel for="change-organization-owner">
              ФИО нового владельца
            </FieldLabel>
            <Input
              id="change-organization-owner"
              :model-value="selectedCompany.ownerFullName"
              type="text"
              variant="default"
              class="h-10"
              readonly
              disabled
            />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="change-organization-email">
              Email нового владельца
            </FieldLabel>
            <Input
              id="change-organization-email"
              v-model="email"
              type="email"
              variant="default"
              class="h-10"
              autocomplete="email"
              placeholder="new.owner@example.ru"
            />
            <FieldError :errors="errors.email ? [errors.email] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="change-organization-reason">
              Причина
            </FieldLabel>
            <Textarea
              id="change-organization-reason"
              v-model="reason"
              rows="3"
              placeholder="Опишите причину смены организации"
            />
            <FieldError :errors="errors.reason ? [errors.reason] : undefined" />
          </Field>

          <Field class="gap-2">
            <div class="flex items-start gap-2">
              <Checkbox
                id="change-organization-confirmed"
                v-model="confirmed"
                class="mt-0.5"
              />
              <FieldLabel
                for="change-organization-confirmed"
                class="cursor-pointer font-normal leading-snug"
              >
                Подтверждаю смену организации и обновление реквизитов
              </FieldLabel>
            </div>
            <FieldError :errors="errors.confirmed ? [errors.confirmed] : undefined" />
          </Field>
        </div>

        <div class="relative z-30 flex shrink-0 justify-end gap-2 border-t border-border bg-background px-4 py-3">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Отмена
          </Button>
          <Button
            type="button"
            @click="handleSubmit"
          >
            Отправить запрос
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
