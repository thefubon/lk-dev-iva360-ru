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
import type { MailMailingGroup, MailingGroupPayload } from '@lib/mail/additional-settings-types'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  editingGroup: MailMailingGroup | null
}>()

const emit = defineEmits<{
  submit: [payload: MailingGroupPayload]
}>()

const submitted = ref(false)

const form = reactive({
  name: '',
  address: '',
  membersCount: '12',
})

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!form.name.trim()) {
    next.name = 'Укажите название группы'
  }

  if (!form.address.trim()) {
    next.address = 'Укажите адрес группы'
  } else if (!form.address.includes('@')) {
    next.address = 'Укажите корректный e-mail'
  }

  const count = Number(form.membersCount)
  if (!form.membersCount.trim() || Number.isNaN(count) || count < 0) {
    next.membersCount = 'Укажите число участников от 0'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function resetForm() {
  form.name = ''
  form.address = ''
  form.membersCount = '12'
  submitted.value = false
}

function fillFromGroup(group: MailMailingGroup) {
  form.name = group.name
  form.address = group.address
  form.membersCount = String(group.membersCount)
}

watch(
  () => [open.value, props.editingGroup] as const,
  ([isOpen, group]) => {
    if (!isOpen) {
      return
    }
    if (group) {
      fillFromGroup(group)
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

  const payload: MailingGroupPayload = {
    name: form.name.trim(),
    address: form.address.trim(),
    membersCount: Number(form.membersCount),
  }

  emit('submit', payload)
  toast.success(props.editingGroup ? 'Группа обновлена' : 'Группа создана', {
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
              {{ editingGroup ? 'Редактировать группу' : 'Создать группу рассылки' }}
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Название, адрес и количество участников группы рассылки.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="onSubmit"
        >
          <Field class="gap-2">
            <FieldLabel for="mailing-group-name">
              Название
            </FieldLabel>
            <Input
              id="mailing-group-name"
              v-model="form.name"
              type="text"
              class="h-10"
              placeholder="Маркетинг"
              :aria-invalid="Boolean(errors.name)"
            />
            <FieldError :errors="errors.name ? [errors.name] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="mailing-group-address">
              Адрес
            </FieldLabel>
            <Input
              id="mailing-group-address"
              v-model="form.address"
              type="email"
              class="h-10 font-mono text-sm"
              placeholder="marketing@example-corp.ru"
              :aria-invalid="Boolean(errors.address)"
            />
            <FieldError :errors="errors.address ? [errors.address] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="mailing-group-members">
              Участников
            </FieldLabel>
            <Input
              id="mailing-group-members"
              v-model="form.membersCount"
              type="text"
              inputmode="numeric"
              class="h-10"
              placeholder="12"
              :aria-invalid="Boolean(errors.membersCount)"
            />
            <FieldError :errors="errors.membersCount ? [errors.membersCount] : undefined" />
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
              {{ editingGroup ? 'Сохранить' : 'Создать' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
