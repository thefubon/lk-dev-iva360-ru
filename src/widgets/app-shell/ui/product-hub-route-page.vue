<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'

defineProps<{
  title: string
  description: string
  productUrl: string
}>()
</script>

<template>
  <main class="container mx-auto flex min-h-0 flex-1 flex-col gap-4 px-6 py-6">
    <slot name="prepend" />
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        {{ title }}
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        {{ description }}
      </p>
    </header>
    <div class="rounded-xl border border-border bg-background p-6">
      <a
        :href="productUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Открыть в IVA 360
        <ArrowUpRight class="size-4 shrink-0" aria-hidden="true" />
      </a>
    </div>
  </main>
</template>
