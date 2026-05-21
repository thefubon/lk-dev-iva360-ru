<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="cn(
      'relative flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-background p-4',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
