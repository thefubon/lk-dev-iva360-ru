<script setup lang="ts">
import { Copy, KeyRound, RefreshCw } from 'lucide-vue-next'
import { Button } from '@/shared/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { AdminPageSection } from '@/widgets/admin-page-section'

const monoInputClass = 'h-10 font-mono text-xs sm:text-sm'

const { apiKey, canCopyApiKey, regenerateApiKey, copyApiKey } = useApiIntegrationKey()
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        API
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Интеграционные ключи и доступ к REST API
      </p>
    </header>

    <AdminPageSection>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <h3 class="text-base font-semibold leading-none">
            Интеграционный ключ для API
          </h3>
          <FieldDescription class="text-sm">
            Создание, ротация и ограничение доступа к REST API
          </FieldDescription>
        </div>

        <Field class="gap-2">
          <FieldLabel for="api-key">
            Текущий ключ
          </FieldLabel>
          <Input
            id="api-key"
            v-model="apiKey"
            type="text"
            variant="default"
            :class="monoInputClass"
            readonly
            :icon-left="KeyRound"
          />
        </Field>

        <div class="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            class="gap-1.5"
            @click="regenerateApiKey"
          >
            <RefreshCw
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            Сгенерировать новый
          </Button>
          <Button
            type="button"
            variant="secondary"
            class="gap-1.5"
            :disabled="!canCopyApiKey"
            @click="copyApiKey"
          >
            <Copy
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            Копировать
          </Button>
        </div>
      </div>
    </AdminPageSection>
  </main>
</template>
