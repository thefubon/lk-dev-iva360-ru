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
  MAIL_RULE_ACTION_LABELS,
  type MailRule,
  type MailRuleAction,
  type MailRulePayload,
  type MailRuleStatus,
} from '@lib/mail/additional-settings-types'
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
  editingRule: MailRule | null
}>()

const emit = defineEmits<{
  submit: [payload: MailRulePayload]
}>()

const ACTION_OPTIONS: MailRuleAction[] = ['reject', 'forward', 'move', 'tag']

const submitted = ref(false)

const form = reactive({
  priority: '100',
  condition: '',
  action: 'reject' as MailRuleAction,
  actionLabel: '',
  enabled: true,
})

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  const priority = Number(form.priority)
  if (!form.priority.trim() || Number.isNaN(priority) || priority < 1 || priority > 999) {
    next.priority = 'Укажите приоритет от 1 до 999'
  }

  if (!form.condition.trim()) {
    next.condition = 'Укажите условие правила'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function resetForm() {
  form.priority = '100'
  form.condition = ''
  form.action = 'reject'
  form.actionLabel = ''
  form.enabled = true
  submitted.value = false
}

function fillFromRule(rule: MailRule) {
  form.priority = String(rule.priority)
  form.condition = rule.condition
  form.action = rule.action
  form.actionLabel = rule.actionLabel
  form.enabled = rule.status === 'enabled'
}

watch(
  () => [open.value, props.editingRule] as const,
  ([isOpen, rule]) => {
    if (!isOpen) {
      return
    }
    if (rule) {
      fillFromRule(rule)
    } else {
      resetForm()
    }
    submitted.value = false
  },
)

watch(
  () => form.action,
  (action) => {
    if (!form.actionLabel.trim() || MAIL_RULE_ACTION_LABELS[action] === form.actionLabel) {
      form.actionLabel = MAIL_RULE_ACTION_LABELS[action]
    }
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

  const payload: MailRulePayload = {
    priority: Number(form.priority),
    condition: form.condition.trim(),
    action: form.action,
    actionLabel: form.actionLabel.trim() || MAIL_RULE_ACTION_LABELS[form.action],
    status: form.enabled ? 'enabled' : 'disabled',
  }

  emit('submit', payload)
  toast.success(props.editingRule ? 'Правило обновлено' : 'Правило создано')
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
              {{ editingRule ? 'Редактировать правило' : 'Создать правило' }}
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Приоритет, условие срабатывания и действие при обработке почты.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form
          class="flex flex-col gap-4 px-4 py-4"
          @submit.prevent="onSubmit"
        >
          <Field class="gap-2">
            <FieldLabel for="mail-rule-priority">
              Приоритет
            </FieldLabel>
            <Input
              id="mail-rule-priority"
              v-model="form.priority"
              type="text"
              inputmode="numeric"
              class="h-10 w-24"
              placeholder="100"
              :aria-invalid="Boolean(errors.priority)"
            />
            <FieldError :errors="errors.priority ? [errors.priority] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="mail-rule-condition">
              Условие
            </FieldLabel>
            <Input
              id="mail-rule-condition"
              v-model="form.condition"
              type="text"
              class="h-10 font-mono text-sm"
              placeholder="От: @spam.ru"
              :aria-invalid="Boolean(errors.condition)"
            />
            <FieldError :errors="errors.condition ? [errors.condition] : undefined" />
          </Field>

          <Field class="gap-2">
            <FieldLabel for="mail-rule-action">
              Действие
            </FieldLabel>
            <Select v-model="form.action">
              <SelectTrigger
                id="mail-rule-action"
                class="h-10"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="action in ACTION_OPTIONS"
                  :key="action"
                  :value="action"
                >
                  {{ MAIL_RULE_ACTION_LABELS[action] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field class="gap-2">
            <FieldLabel for="mail-rule-action-label">
              Подпись действия
            </FieldLabel>
            <Input
              id="mail-rule-action-label"
              v-model="form.actionLabel"
              type="text"
              class="h-10"
              placeholder="Отклонить"
            />
          </Field>

          <div class="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <Label
              for="mail-rule-enabled"
              class="text-sm font-medium"
            >
              Правило включено
            </Label>
            <Switch
              id="mail-rule-enabled"
              v-model:checked="form.enabled"
            />
          </div>

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
              {{ editingRule ? 'Сохранить' : 'Создать' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
