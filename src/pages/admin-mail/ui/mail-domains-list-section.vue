<script setup lang="ts">
import { Check, Plus, X } from 'lucide-vue-next'
import { useMailDomains } from '@/app/composables/useMailDomains'
import type { AddMailServerPayload, DnsRecordStatus, MailDomain } from '@lib/mail/types'
import { Button } from '@/shared/ui/button'
import AddMailServerDialog from './add-mail-server-dialog.vue'
import MailDomainSettingsDialog from './mail-domain-settings-dialog.vue'

const { domains, ready: domainsReady, addDomain, updateDomain } = useMailDomains()

const addServerDialogOpen = ref(false)
const domainSettingsDialogOpen = ref(false)
const selectedDomain = ref<MailDomain | null>(null)

function dnsPillClass(status: DnsRecordStatus): string {
  return status === 'ok'
    ? 'border-primary/30 bg-primary/10 text-primary'
    : 'border-destructive/30 bg-destructive/10 text-destructive'
}

function domainStatusDotClass(status: MailDomain['status']): string {
  return status === 'online' ? 'bg-primary' : 'bg-amber-500'
}

function onAddServer(payload: AddMailServerPayload) {
  addDomain(payload)
}

function openDomainSettings(domain: MailDomain) {
  selectedDomain.value = domain
  domainSettingsDialogOpen.value = true
}

function onSaveDomainSettings(id: string, patch: Partial<MailDomain>) {
  updateDomain(id, patch)
}
</script>

<template>
  <div
    class="flex flex-col gap-4"
    aria-labelledby="mail-domains-heading"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 flex-col gap-1">
        <h2
          id="mail-domains-heading"
          class="text-base font-medium text-foreground"
        >
          Почтовые домены
        </h2>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Список доменов, DNS-записи и подключённые серверы
        </p>
      </div>
      <Button
        type="button"
        class="shrink-0 gap-1.5"
        @click="addServerDialogOpen = true"
      >
        <Plus
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        Добавить
      </Button>
    </div>

    <div
      v-if="!domainsReady"
      class="text-muted-foreground text-sm"
    >
      Загрузка доменов...
    </div>

    <div
      v-else
      class="flex flex-col gap-2"
    >
      <article
        v-for="domain in domains"
        :key="domain.id"
        class="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white px-4 py-3"
      >
        <span
          class="relative flex size-2.5 shrink-0"
          :title="domain.status === 'online' ? 'Онлайн' : 'Требует внимания'"
          aria-hidden="true"
        >
          <span
            class="inline-flex size-2.5 rounded-full"
            :class="domainStatusDotClass(domain.status)"
          />
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-sm font-medium text-foreground">
              {{ domain.name }}
            </span>
            <span
              v-if="domain.isPrimary"
              class="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              Основной
            </span>
          </div>
          <p
            v-if="domain.description"
            class="text-muted-foreground mt-0.5 text-xs"
          >
            {{ domain.description }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <span
            class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
            :class="dnsPillClass(domain.dkim)"
          >
            DKIM
            <Check
              v-if="domain.dkim === 'ok'"
              class="size-3"
              aria-hidden="true"
            />
            <X
              v-else
              class="size-3"
              aria-hidden="true"
            />
          </span>
          <span
            class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
            :class="dnsPillClass(domain.spf)"
          >
            SPF
            <Check
              v-if="domain.spf === 'ok'"
              class="size-3"
              aria-hidden="true"
            />
            <X
              v-else
              class="size-3"
              aria-hidden="true"
            />
          </span>
          <span
            class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
            :class="dnsPillClass(domain.dmarc)"
          >
            DMARC
            <Check
              v-if="domain.dmarc === 'ok'"
              class="size-3"
              aria-hidden="true"
            />
            <X
              v-else
              class="size-3"
              aria-hidden="true"
            />
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="shrink-0 text-primary"
          @click="openDomainSettings(domain)"
        >
          Настр.
        </Button>
      </article>
    </div>
  </div>

  <AddMailServerDialog
    v-model:open="addServerDialogOpen"
    @submit="onAddServer"
  />

  <MailDomainSettingsDialog
    v-model:open="domainSettingsDialogOpen"
    :domain="selectedDomain"
    @save="onSaveDomainSettings"
  />
</template>
