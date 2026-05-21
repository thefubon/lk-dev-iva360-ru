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
import { createDefaultDomainPolicies } from '@lib/mail/default-mail-data'
import type { DnsRecordStatus, MailDomain, SmtpEncryption } from '@lib/mail/types'
import { Button } from '@/shared/ui/button'
import { DialogCloseButton, DialogHeader } from '@/shared/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'

const SMTP_ENCRYPTION_OPTIONS: { value: SmtpEncryption; label: string }[] = [
  { value: 'tls', label: 'TLS (STARTTLS)' },
  { value: 'ssl', label: 'SSL' },
  { value: 'none', label: 'Без шифрования' },
]

const DNS_STATUS_OPTIONS: { value: DnsRecordStatus; label: string }[] = [
  { value: 'ok', label: 'Настроено' },
  { value: 'fail', label: 'Не настроено' },
]

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  domain: MailDomain | null
}>()

const emit = defineEmits<{
  save: [id: string, patch: Partial<MailDomain>]
}>()

const form = reactive({
  name: '',
  description: '',
  isPrimary: false,
  smtpHost: '',
  smtpPort: '587',
  smtpEncryption: 'tls' as SmtpEncryption,
  smtpLogin: '',
  smtpPassword: '',
  imapHost: '',
  imapPort: '993',
  pop3Port: '995',
  dkim: 'fail' as DnsRecordStatus,
  spf: 'fail' as DnsRecordStatus,
  dmarc: 'fail' as DnsRecordStatus,
  dkimSelector: '',
  dkimPublicKey: '',
  policies: createDefaultDomainPolicies(),
})

watch(
  () => props.domain,
  (domain) => {
    if (!domain) {
      return
    }

    form.name = domain.name
    form.description = domain.description
    form.isPrimary = domain.isPrimary
    form.smtpHost = domain.smtpHost
    form.smtpPort = String(domain.smtpPort)
    form.smtpEncryption = domain.smtpEncryption
    form.smtpLogin = domain.smtpLogin
    form.smtpPassword = domain.smtpPassword
    form.imapHost = domain.imapHost
    form.imapPort = String(domain.imapPort)
    form.pop3Port = String(domain.pop3Port)
    form.dkim = domain.dkim
    form.spf = domain.spf
    form.dmarc = domain.dmarc
    form.dkimSelector = domain.dkimSelector
    form.dkimPublicKey = domain.dkimPublicKey
    form.policies = { ...domain.policies }
  },
  { immediate: true },
)

function onOpenChange(value: boolean) {
  open.value = value
}

function parsePort(value: string, fallback: number): number {
  const port = Number(value)
  return Number.isFinite(port) && port >= 1 && port <= 65535 ? port : fallback
}

function onSubmit() {
  if (!props.domain) {
    return
  }

  emit('save', props.domain.id, {
    name: form.name.trim(),
    description: form.description.trim(),
    isPrimary: form.isPrimary,
    smtpHost: form.smtpHost.trim(),
    smtpPort: parsePort(form.smtpPort, 587),
    smtpEncryption: form.smtpEncryption,
    smtpLogin: form.smtpLogin.trim(),
    smtpPassword: form.smtpPassword,
    imapHost: form.imapHost.trim(),
    imapPort: parsePort(form.imapPort, 993),
    pop3Port: parsePort(form.pop3Port, 995),
    dkim: form.dkim,
    spf: form.spf,
    dmarc: form.dmarc,
    dkimSelector: form.dkimSelector.trim(),
    dkimPublicKey: form.dkimPublicKey.trim(),
    policies: { ...form.policies },
  })

  toast.success('Настройки домена сохранены', {
    description: form.name.trim() || props.domain.name,
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
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex max-h-[min(90dvh,48rem)] w-[calc(100vw-2rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <DialogHeader>
          <div class="min-w-0 flex-1 pr-2">
            <DialogTitle class="text-base font-medium text-foreground">
              Настройки домена
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              {{ domain?.name ?? 'Параметры почтового домена' }}
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form
          v-if="domain"
          class="flex min-h-0 flex-1 flex-col"
          @submit.prevent="onSubmit"
        >
          <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
            <section class="flex flex-col gap-4">
              <h3 class="text-sm font-semibold text-foreground">
                Основное
              </h3>

              <Field class="gap-2">
                <FieldLabel for="domain-name">
                  Доменное имя
                </FieldLabel>
                <Input
                  id="domain-name"
                  v-model="form.name"
                  type="text"
                  variant="default"
                  class="h-10 font-mono text-sm"
                  autocomplete="off"
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="domain-description">
                  Описание
                </FieldLabel>
                <Textarea
                  id="domain-description"
                  v-model="form.description"
                  class="min-h-20 resize-y"
                />
              </Field>

              <div class="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-foreground">
                    Основной домен
                  </p>
                  <FieldDescription>
                    Используется по умолчанию для новых ящиков
                  </FieldDescription>
                </div>
                <Switch
                  id="domain-is-primary"
                  v-model="form.isPrimary"
                />
              </div>
            </section>

            <section class="flex flex-col gap-4 border-t border-border pt-4">
              <h3 class="text-sm font-semibold text-foreground">
                SMTP
              </h3>

              <div class="grid gap-4 sm:grid-cols-2">
                <Field class="gap-2 sm:col-span-2">
                  <FieldLabel for="domain-smtp-host">
                    Хост SMTP
                  </FieldLabel>
                  <Input
                    id="domain-smtp-host"
                    v-model="form.smtpHost"
                    type="text"
                    variant="default"
                    class="h-10 font-mono text-sm"
                    autocomplete="off"
                  />
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="domain-smtp-port">
                    Порт SMTP
                  </FieldLabel>
                  <Input
                    id="domain-smtp-port"
                    v-model="form.smtpPort"
                    type="text"
                    inputmode="numeric"
                    variant="default"
                    class="h-10 font-mono text-sm"
                    autocomplete="off"
                  />
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="domain-smtp-encryption">
                    Шифрование
                  </FieldLabel>
                  <Select v-model="form.smtpEncryption">
                    <SelectTrigger
                      id="domain-smtp-encryption"
                      class="h-10 w-full"
                    >
                      <SelectValue placeholder="Выберите шифрование" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem
                        v-for="option in SMTP_ENCRYPTION_OPTIONS"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field class="gap-2 sm:col-span-2">
                  <FieldLabel for="domain-smtp-login">
                    Логин SMTP
                  </FieldLabel>
                  <Input
                    id="domain-smtp-login"
                    v-model="form.smtpLogin"
                    type="text"
                    variant="default"
                    class="h-10 font-mono text-sm"
                    autocomplete="username"
                  />
                </Field>

                <Field class="gap-2 sm:col-span-2">
                  <FieldLabel for="domain-smtp-password">
                    Пароль SMTP
                  </FieldLabel>
                  <Input
                    id="domain-smtp-password"
                    v-model="form.smtpPassword"
                    type="password"
                    variant="default"
                    class="h-10 font-mono text-sm"
                    autocomplete="new-password"
                  />
                </Field>
              </div>
            </section>

            <section class="flex flex-col gap-4 border-t border-border pt-4">
              <h3 class="text-sm font-semibold text-foreground">
                IMAP / POP3
              </h3>

              <Field class="gap-2">
                <FieldLabel for="domain-imap-host">
                  Хост IMAP
                </FieldLabel>
                <Input
                  id="domain-imap-host"
                  v-model="form.imapHost"
                  type="text"
                  variant="default"
                  class="h-10 font-mono text-sm"
                  autocomplete="off"
                />
              </Field>

              <div class="grid gap-4 sm:grid-cols-2">
                <Field class="gap-2">
                  <FieldLabel for="domain-imap-port">
                    Порт IMAP
                  </FieldLabel>
                  <Input
                    id="domain-imap-port"
                    v-model="form.imapPort"
                    type="text"
                    inputmode="numeric"
                    variant="default"
                    class="h-10 font-mono text-sm"
                    autocomplete="off"
                  />
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="domain-pop3-port">
                    Порт POP3
                  </FieldLabel>
                  <Input
                    id="domain-pop3-port"
                    v-model="form.pop3Port"
                    type="text"
                    inputmode="numeric"
                    variant="default"
                    class="h-10 font-mono text-sm"
                    autocomplete="off"
                  />
                </Field>
              </div>
            </section>

            <section class="flex flex-col gap-4 border-t border-border pt-4">
              <h3 class="text-sm font-semibold text-foreground">
                DNS-записи
              </h3>

              <div class="grid gap-4 sm:grid-cols-3">
                <Field class="gap-2">
                  <FieldLabel for="domain-dkim-status">
                    DKIM
                  </FieldLabel>
                  <Select v-model="form.dkim">
                    <SelectTrigger
                      id="domain-dkim-status"
                      class="h-10 w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem
                        v-for="option in DNS_STATUS_OPTIONS"
                        :key="`dkim-${option.value}`"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="domain-spf-status">
                    SPF
                  </FieldLabel>
                  <Select v-model="form.spf">
                    <SelectTrigger
                      id="domain-spf-status"
                      class="h-10 w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem
                        v-for="option in DNS_STATUS_OPTIONS"
                        :key="`spf-${option.value}`"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="domain-dmarc-status">
                    DMARC
                  </FieldLabel>
                  <Select v-model="form.dmarc">
                    <SelectTrigger
                      id="domain-dmarc-status"
                      class="h-10 w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem
                        v-for="option in DNS_STATUS_OPTIONS"
                        :key="`dmarc-${option.value}`"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field class="gap-2">
                <FieldLabel for="domain-dkim-selector">
                  Селектор DKIM
                </FieldLabel>
                <Input
                  id="domain-dkim-selector"
                  v-model="form.dkimSelector"
                  type="text"
                  variant="default"
                  class="h-10 font-mono text-sm"
                  autocomplete="off"
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="domain-dkim-key">
                  Публичный ключ DKIM
                </FieldLabel>
                <Textarea
                  id="domain-dkim-key"
                  v-model="form.dkimPublicKey"
                  class="min-h-24 resize-y font-mono text-xs"
                  placeholder="v=DKIM1; k=rsa; p=..."
                />
              </Field>
            </section>

            <section class="flex flex-col gap-4 border-t border-border pt-4">
              <div class="flex flex-col gap-1">
                <h3 class="text-sm font-semibold text-foreground">
                  Политики домена
                </h3>
                <p class="text-muted-foreground text-xs leading-relaxed">
                  Быстрые настройки для этого домена. Подробные политики — в карточках ниже на странице.
                </p>
              </div>

              <div class="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-foreground">
                    Архивирование
                  </p>
                </div>
                <Switch
                  id="domain-archive-enabled"
                  v-model="form.policies.archiveEnabled"
                />
              </div>
              <Field class="gap-2">
                <FieldLabel for="domain-archive-days">
                  Срок архива, дней
                </FieldLabel>
                <Input
                  id="domain-archive-days"
                  v-model.number="form.policies.archiveRetentionDays"
                  type="number"
                  min="1"
                  variant="default"
                  class="h-10"
                  :disabled="!form.policies.archiveEnabled"
                />
              </Field>

              <div class="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-foreground">
                    Очистка спама
                  </p>
                </div>
                <Switch
                  id="domain-spam-cleanup"
                  v-model="form.policies.spamCleanupEnabled"
                />
              </div>
              <Field class="gap-2">
                <FieldLabel for="domain-spam-days">
                  Удалять спам через, дней
                </FieldLabel>
                <Input
                  id="domain-spam-days"
                  v-model.number="form.policies.spamRetentionDays"
                  type="number"
                  min="1"
                  variant="default"
                  class="h-10"
                  :disabled="!form.policies.spamCleanupEnabled"
                />
              </Field>

              <div class="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-foreground">
                    Очистка корзины
                  </p>
                </div>
                <Switch
                  id="domain-trash-cleanup"
                  v-model="form.policies.trashCleanupEnabled"
                />
              </div>
              <Field class="gap-2">
                <FieldLabel for="domain-trash-days">
                  Удалять из корзины через, дней
                </FieldLabel>
                <Input
                  id="domain-trash-days"
                  v-model.number="form.policies.trashRetentionDays"
                  type="number"
                  min="1"
                  variant="default"
                  class="h-10"
                  :disabled="!form.policies.trashCleanupEnabled"
                />
              </Field>

              <div class="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-3">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-foreground">
                    Корпоративная подпись
                  </p>
                </div>
                <Switch
                  id="domain-corp-signature"
                  v-model="form.policies.corporateSignatureEnabled"
                />
              </div>

              <div class="grid gap-4 sm:grid-cols-3">
                <Field class="gap-2">
                  <FieldLabel for="domain-max-incoming">
                    Входящие, МБ
                  </FieldLabel>
                  <Input
                    id="domain-max-incoming"
                    v-model.number="form.policies.maxIncomingMb"
                    type="number"
                    min="1"
                    variant="default"
                    class="h-10"
                  />
                </Field>
                <Field class="gap-2">
                  <FieldLabel for="domain-max-outgoing">
                    Исходящие, МБ
                  </FieldLabel>
                  <Input
                    id="domain-max-outgoing"
                    v-model.number="form.policies.maxOutgoingMb"
                    type="number"
                    min="1"
                    variant="default"
                    class="h-10"
                  />
                </Field>
                <Field class="gap-2">
                  <FieldLabel for="domain-max-attachment">
                    Вложения, МБ
                  </FieldLabel>
                  <Input
                    id="domain-max-attachment"
                    v-model.number="form.policies.maxAttachmentMb"
                    type="number"
                    min="1"
                    variant="default"
                    class="h-10"
                  />
                </Field>
              </div>
            </section>
          </div>

          <div class="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border px-4 py-3">
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
