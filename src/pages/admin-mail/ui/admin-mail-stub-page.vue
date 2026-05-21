<script setup lang="ts">
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { AdminPageSection } from '@/widgets/admin-page-section'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Почта
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Управление доменами, ящиками, группами, правилами
      </p>
    </header>

    <AdminPageSection>
      <Card class="gap-4 bg-white py-4">
        <CardHeader class="px-4">
          <CardTitle class="text-base">
            {{ title }}
          </CardTitle>
          <CardDescription>
            {{ description }}
          </CardDescription>
        </CardHeader>
      </Card>
    </AdminPageSection>
  </main>
</template>
