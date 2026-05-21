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
import { useMailDomains } from '@/app/composables/useMailDomains'
import type { CatchAllPayload, MailCatchAllConfig } from '@lib/mail/additional-settings-types'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
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
  config: MailCatchAllConfig
}>()

const emit = defineEmits<{
  submit: [payload: CatchAllPayload]
}>()

const { domains } = useMailDomains()

const submitted = ref(false)

const form = reactive({
  enabled: true,
  domain: 'example-corp.ru',
  localPart: 'lost-mail',
})

const domainOptions = computed(() => {
  const names = domains.value.map(domain => domain.name)
  return names.length > 0 ? names : ['example-corp.ru']
})

const errors = computed(() => {
  if (!submitted.value || !form.enabled) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!form.localPart.trim()) {
    next.localPart = 'Укажите локальную часть адреса'
  }

  if (!form.domain.trim()) {
    next.domain = 'Выберите домен'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

const previewAddress = computed(() =>
  form.enabled && form.localPart && form.domain
    ? `${form.localPart}@${form.domain}`
    : '—',
)

watch(
  () => [open.value, props.config] as const,
  ([isOpen, config]) => {
    if (!isOpen) {
      return
    }
    form.enabled = config.enabled
    form.domain = config.domain
    form.localPart = config.localPart
    submitted.value = false
  },
)

function onOpenChange(value: boolean) {
  open.value = value
}

function onSubmit() {
  submitted.value = true
  if (!isValid.value) {
    return
  }

  const payload: CatchAllPayload = {
    enabled: form.enabled,
    domain: form.domain,
    localPart: form.localPart.trim(),
  }

  emit('submit', payload)
  toast.success('Настройки catch-all сохранены', {
    description: payload.enabled ? `${payload.localPart}@${payload.domain}` : 'Отключено',
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
              Ящик для потерянных писем
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Catch-all: письма на несуществующие адреса домена попадают в указанный ящик.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="onSubmit"
        >
          <div class="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div class="flex flex-col gap-0.5">
              <Label
                for="catch-all-enabled"
                class="text-sm font-medium"
              >
                Включить catch-all
              </Label>
              <p class="text-muted-foreground text-xs">
                Перенаправлять письма на несуществующие адреса
              </p>
            </div>
            <Switch
              id="catch-all-enabled"
              v-model:checked="form.enabled"
            />
          </div>

          <template v-if="form.enabled">
            <Field class="gap-2">
              <FieldLabel for="catch-all-domain">
                Домен
              </FieldLabel>
              <Select v-model="form.domain">
                <SelectTrigger
                  id="catch-all-domain"
                  class="h-10"
                >
                  <SelectValue placeholder="Выберите домен" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="domain in domainOptions"
                    :key="domain"
                    :value="domain"
                  >
                    {{ domain }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldError :errors="errors.domain ? [errors.domain] : undefined" />
            </Field>

            <Field class="gap-2">
              <FieldLabel for="catch-all-local">
                Локальная часть
              </FieldLabel>
              <div class="flex items-center gap-2">
                <Input
                  id="catch-all-local"
                  v-model="form.localPart"
                  type="text"
                  class="h-10 font-mono text-sm"
                  placeholder="lost-mail"
                  :aria-invalid="Boolean(errors.localPart)"
                />
                <span class="text-muted-foreground shrink-0 text-sm">@{{ form.domain }}</span>
              </div>
              <FieldError :errors="errors.localPart ? [errors.localPart] : undefined" />
            </Field>

            <p class="text-muted-foreground text-sm">
              Итоговый адрес:
              <span class="font-mono text-foreground">{{ previewAddress }}</span>
            </p>
          </template>

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
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
