<script setup lang="ts">
import { cn } from '@lib/utils'

const sections = [
  {
    to: '/integration/api',
    title: 'Настройки API',
    description: 'Ключи и вызовы API для связки с внешними системами.',
  },
  {
    to: '/integration/ldap',
    title: 'Настройки LDAP',
    description: 'Синхронизация каталога и вход по корпоративной учётной записи.',
  },
  {
    to: '/integration/sso',
    title: 'Настройки SSO',
    description: 'Единый вход через провайдера удостоверений.',
  },
] as const

useSeoMeta({
  title: 'Интеграции',
  description: 'Раздел интеграций личного кабинета IVA 360: API, LDAP и SSO.',
})
</script>

<template>
  <main class="container mx-auto flex min-h-0 flex-1 flex-col gap-6 px-6 py-6">
    <header class="flex max-w-2xl flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Интеграции
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Выберите подраздел. Детальная настройка выполняется в продукте IVA 360 — со страниц подразделов можно перейти в сервис.
      </p>
    </header>

    <ul class="grid max-w-3xl gap-3 sm:grid-cols-1 md:grid-cols-2">
      <li v-for="item in sections" :key="item.to">
        <NuxtLink
          :to="item.to"
          :class="cn(
            'flex flex-col gap-1 rounded-lg border border-border bg-background p-4 text-left transition-colors',
            'hover:border-primary/40 hover:bg-muted/40',
          )"
        >
          <span class="text-sm font-medium text-foreground">{{ item.title }}</span>
          <span class="text-muted-foreground text-xs leading-relaxed">{{ item.description }}</span>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
