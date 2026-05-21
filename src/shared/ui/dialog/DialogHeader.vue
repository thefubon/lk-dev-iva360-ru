<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-slot="dialog-header"
    :class="cn(
      'flex shrink-0 items-start justify-between border-b border-border px-4 py-3',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
