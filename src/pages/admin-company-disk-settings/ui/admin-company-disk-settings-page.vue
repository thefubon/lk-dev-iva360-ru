<script setup lang="ts">
import { AdminPageSection } from '@/widgets/admin-page-section'
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Общие настройки
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Общие параметры корпоративного диска: политики хранения, доступ и базовые
        настройки сервиса.
      </p>
    </header>

    <AdminPageSection>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Раздел в разработке.
      </p>
    </AdminPageSection>
  </main>
</template>
