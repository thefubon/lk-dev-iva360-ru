<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '@lib/utils'

const props = defineProps<{
  class?: HTMLAttributes["class"]
  /** Optional class on the scroll wrapper (default: scroll when content overflows). */
  containerClass?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="table-container"
    :class="
      cn(
        'relative w-full min-w-0 overflow-auto',
        props.containerClass,
      )
    "
  >
    <table data-slot="table" :class="cn('w-full caption-bottom text-sm', props.class)">
      <slot />
    </table>
  </div>
</template>
