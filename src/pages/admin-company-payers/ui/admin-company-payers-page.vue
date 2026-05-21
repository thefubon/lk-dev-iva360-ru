<script setup lang="ts">
import { Info, Loader2, Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { AddPayerDialog } from '@/features/add-payer'
import { loadInitialPayers } from '@/shared/lib/payers/load-initial-payers'
import {
  type AddPayerPayload,
  type Payer,
} from '@/shared/lib/payers/types'
import { Button } from '@/shared/ui/button'

const payers = ref<Payer[]>([])
const payersLoading = ref(true)
const payerDialogOpen = ref(false)
const editingPayer = ref<Payer | null>(null)

onMounted(async () => {
  try {
    payers.value = await loadInitialPayers()
  } finally {
    payersLoading.value = false
  }
})

function openAddDialog() {
  editingPayer.value = null
  payerDialogOpen.value = true
}

function openEditDialog(payer: Payer) {
  editingPayer.value = payer
  payerDialogOpen.value = true
}

function clearDefaultExcept(payerId?: string) {
  payers.value.forEach((payer) => {
    if (payer.id !== payerId) {
      payer.isDefault = false
    }
  })
}

function makeDefaultPayer(payer: Payer) {
  clearDefaultExcept(payer.id)
  payer.isDefault = true
  toast.success('Плательщик по умолчанию изменён')
}

function onPayerSubmit(payload: AddPayerPayload) {
  if (payload.isDefault) {
    clearDefaultExcept(editingPayer.value?.id)
  }

  if (editingPayer.value) {
    const index = payers.value.findIndex(
      (payer) => payer.id === editingPayer.value!.id,
    )
    if (index !== -1) {
      payers.value[index] = {
        ...editingPayer.value,
        ...payload,
      }
    }
    editingPayer.value = null
    return
  }

  payers.value.push({
    id: `p${Date.now()}`,
    ...payload,
  })
}
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Плательщики
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Управление плательщиками и платёжными реквизитами компании.
      </p>
    </header>

    <div class="flex flex-col gap-6">
      <div
        role="status"
        class="flex flex-wrap items-center justify-between gap-4"
      >
        <p class="flex min-w-0 flex-1 items-center gap-2 text-sm leading-snug text-foreground">
          <Info
            class="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span>
            <strong class="font-medium">Плательщик</strong>
            — юрлицо, от имени которого выставляются счета. Схема: Плательщик → Заказ → Счёт → Документы.
          </span>
        </p>

        <Button
          type="button"
          class="shrink-0 gap-1.5"
          :disabled="payersLoading"
          @click="openAddDialog"
        >
          <Plus
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          Добавить плательщика
        </Button>
      </div>

      <div
        v-if="payersLoading"
        class="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"
      >
        <Loader2
          class="size-4 animate-spin"
          aria-hidden="true"
        />
        Загрузка плательщиков…
      </div>

      <div
        v-else-if="payers.length"
        class="grid items-stretch gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="payer in payers"
          :key="payer.id"
          class="relative flex h-full flex-col justify-between gap-2 overflow-hidden rounded-lg bg-white p-4"
        >
          <div class="flex flex-col gap-2">
            <span
              v-if="payer.isDefault"
              class="absolute top-0 right-0 inline-flex items-center rounded-none rounded-bl-md bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground"
            >
              По умолчанию
            </span>

            <h2 :class="['pr-24 text-lg font-semibold', payer.isDefault ? 'text-primary' : 'text-foreground']">
              {{ payer.name }}
            </h2>

            <p class="font-mono text-xs text-muted-foreground">
              ИНН: {{ payer.inn }}<template v-if="payer.kpp"> · КПП: {{ payer.kpp }}</template>
            </p>

            <p
              v-if="payer.legalAddress"
              class="text-muted-foreground text-xs leading-relaxed"
            >
              {{ payer.legalAddress }}
            </p>
          </div>

          <div class="flex flex-wrap justify-end gap-2">
            <Button
              v-if="!payer.isDefault"
              type="button"
              variant="secondary"
              class="h-9"
              @click="makeDefaultPayer(payer)"
            >
              Сделать основным
            </Button>
            <Button
              type="button"
              variant="outline"
              class="h-9"
              @click="openEditDialog(payer)"
            >
              Изменить
            </Button>
          </div>
        </article>
      </div>

      <p
        v-else
        class="text-muted-foreground text-sm leading-relaxed"
      >
        Нет плательщиков. Добавьте плательщика для оформления заказов.
      </p>

      <AddPayerDialog
        v-model:open="payerDialogOpen"
        :payer="editingPayer"
        @submit="onPayerSubmit"
      />
    </div>
  </main>
</template>
