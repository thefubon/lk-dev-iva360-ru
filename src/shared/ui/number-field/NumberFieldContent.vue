<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, inject } from "vue"
import { cn } from '@lib/utils'
import { numberFieldSizeKey } from "./context"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const size = inject(numberFieldSizeKey, computed(() => "default"))
const sizeClass = computed(() => {
  // Важно: селекторы должны соответствовать паддингам `increment`/`decrement`
  if (size.value === "sm")
    return "[&>[data-slot=input]]:has-[[data-slot=increment]]:pr-4 [&>[data-slot=input]]:has-[[data-slot=decrement]]:pl-4"
  if (size.value === "lg")
    return "[&>[data-slot=input]]:has-[[data-slot=increment]]:pr-6 [&>[data-slot=input]]:has-[[data-slot=decrement]]:pl-6"
  return "[&>[data-slot=input]]:has-[[data-slot=increment]]:pr-5 [&>[data-slot=input]]:has-[[data-slot=decrement]]:pl-5"
})
</script>

<template>
  <div :class="cn('relative', sizeClass, props.class)">
    <slot />
  </div>
</template>
