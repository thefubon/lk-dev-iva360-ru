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
import type { ChangeOwnerRequestPayload, SelectedFio } from '@/shared/lib/dadata/types'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import FioSearchCombobox from './fio-search-combobox.vue'

const props = defineProps<{
  initialOwnerEmail?: string
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [payload: ChangeOwnerRequestPayload]
}>()

const selectedFio = ref<SelectedFio | null>(null)
const email = ref('')
const reason = ref('')
const confirmed = ref(false)
const submitted = ref(false)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!selectedFio.value?.fullName.trim()) {
    next.fio = 'Выберите ФИО нового владельца из подсказок DaData'
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
    next.confirmed = 'Подтвердите смену владельца'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function resetForm() {
  selectedFio.value = null
  email.value = ''
  reason.value = ''
  confirmed.value = false
  submitted.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    resetForm()
    return
  }

  const hint = props.initialOwnerEmail?.trim()
  if (hint) {
    email.value = hint
  }
})

function handleCancel() {
  open.value = false
}

function handleSubmit() {
  submitted.value = true

  if (!isValid.value || !selectedFio.value) {
    return
  }

  const payload: ChangeOwnerRequestPayload = {
    ownerFullName: selectedFio.value.fullName,
    email: email.value.trim(),
    reason: reason.value.trim(),
  }

  emit('submit', payload)
  open.value = false
  toast.success('Запрос на смену владельца отправлен', {
    description: 'Ожидается подтверждение обеих сторон.',
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
            Смена владельца
          </DialogTitle>
          <DialogDescription class="sr-only">
            Форма запроса на смену владельца организации с подтверждением обеих сторон.
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

        <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          <div
            role="status"
            class="flex gap-2 rounded-lg border border-warning/25 bg-warning-secondary px-3 py-2.5 text-sm leading-snug text-warning"
          >
            <AlertTriangle
              class="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>Требует подтверждения обеих сторон</span>
          </div>

          <Field class="gap-2">
            <FieldLabel for="change-owner-fio">
              ФИО нового владельца
            </FieldLabel>
            <FioSearchCombobox
              id="change-owner-fio"
              v-model="selectedFio"
              placeholder="Иванов Иван Иванович"
            />
            <FieldError :errors="errors.fio ? [errors.fio] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="change-owner-email">
              Email нового владельца
            </FieldLabel>
            <Input
              id="change-owner-email"
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
            <FieldLabel for="change-owner-reason">
              Причина
            </FieldLabel>
            <Textarea
              id="change-owner-reason"
              v-model="reason"
              rows="3"
              placeholder="Опишите причину смены владельца"
            />
            <FieldError :errors="errors.reason ? [errors.reason] : undefined" />
          </Field>

          <Field class="gap-2">
            <div class="flex items-start gap-2">
              <Checkbox
                id="change-owner-confirmed"
                v-model="confirmed"
                class="mt-0.5"
              />
              <FieldLabel
                for="change-owner-confirmed"
                class="cursor-pointer font-normal leading-snug"
              >
                Подтверждаю смену владельца организации
              </FieldLabel>
            </div>
            <FieldError :errors="errors.confirmed ? [errors.confirmed] : undefined" />
          </Field>
        </div>

        <div class="flex shrink-0 justify-end gap-2 border-t border-border px-4 py-3">
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
