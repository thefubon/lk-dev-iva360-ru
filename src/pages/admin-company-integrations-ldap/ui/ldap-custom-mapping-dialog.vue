<script setup lang="ts">
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import type { AddCustomMappingPayload } from '@/app/composables/useLdapAttributeMapping'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  ldapAttributeExists: (ldapAttribute: string) => boolean
}>()

const emit = defineEmits<{
  submit: [payload: AddCustomMappingPayload]
}>()

const monoInputClass = 'h-10 font-mono text-xs sm:text-sm'

const form = reactive({
  ldapAttribute: '',
  fieldLabel: '',
  updateOnSync: true,
  mandatory: false,
})

const submitted = ref(false)

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}
  const ldapAttribute = form.ldapAttribute.trim()
  const fieldLabel = form.fieldLabel.trim()

  if (!ldapAttribute) {
    next.ldapAttribute = 'Укажите LDAP-атрибут'
  } else if (props.ldapAttributeExists(ldapAttribute)) {
    next.ldapAttribute = 'Такой атрибут уже есть в таблице'
  }

  if (!fieldLabel) {
    next.fieldLabel = 'Укажите поле IVA 360'
  }

  return next
})

function resetForm() {
  form.ldapAttribute = ''
  form.fieldLabel = ''
  form.updateOnSync = true
  form.mandatory = false
  submitted.value = false
}

function handleClose() {
  open.value = false
}

function handleSubmit() {
  submitted.value = true
  if (Object.keys(errors.value).length > 0) {
    return
  }

  emit('submit', {
    ldapAttribute: form.ldapAttribute.trim(),
    fieldLabel: form.fieldLabel.trim(),
    updateOnSync: form.updateOnSync,
    mandatory: form.mandatory,
  })
  handleClose()
}

watch(open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/50"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex w-[calc(100vw-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <div class="flex shrink-0 items-start justify-between border-b border-border px-4 py-3">
          <div class="min-w-0 flex-1 pr-2">
            <DialogTitle class="text-base font-medium text-foreground">
              Кастомный маппинг
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Связь LDAP-атрибута с полем профиля IVA 360
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 rounded-full bg-muted text-foreground hover:bg-muted/80"
              aria-label="Закрыть"
              @click="handleClose"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="handleSubmit"
        >
          <Field class="gap-2">
            <FieldLabel for="custom-ldap-attribute">
              LDAP-атрибут
            </FieldLabel>
            <Input
              id="custom-ldap-attribute"
              v-model="form.ldapAttribute"
              type="text"
              variant="default"
              :class="monoInputClass"
              placeholder="extensionAttribute1"
              autocomplete="off"
              :aria-invalid="Boolean(errors.ldapAttribute)"
            />
            <FieldError :errors="errors.ldapAttribute ? [errors.ldapAttribute] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="custom-field-label">
              Поле IVA 360
            </FieldLabel>
            <Input
              id="custom-field-label"
              v-model="form.fieldLabel"
              type="text"
              variant="default"
              class="h-10"
              placeholder="Название поля"
              autocomplete="off"
              :aria-invalid="Boolean(errors.fieldLabel)"
            />
            <FieldError :errors="errors.fieldLabel ? [errors.fieldLabel] : undefined" />
          </Field>

          <div class="flex flex-col rounded-lg border border-border">
            <div class="flex items-center justify-between gap-4 px-3 py-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-foreground">
                  Обновлять при синхронизации
                </p>
              </div>
              <Switch
                id="custom-update-on-sync"
                v-model="form.updateOnSync"
              />
            </div>
            <div class="flex items-center justify-between gap-4 border-t border-border px-3 py-3">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-foreground">
                  Обязательное поле
                </p>
              </div>
              <Switch
                id="custom-mandatory"
                v-model="form.mandatory"
              />
            </div>
          </div>
        </form>

        <div class="flex shrink-0 justify-end gap-2 border-t border-border bg-background px-4 py-3">
          <Button
            type="button"
            variant="outline"
            @click="handleClose"
          >
            Отмена
          </Button>
          <Button
            type="button"
            @click="handleSubmit"
          >
            Добавить
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
