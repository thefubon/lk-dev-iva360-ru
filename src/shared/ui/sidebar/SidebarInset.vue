<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '@lib/utils'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="sidebar-inset"
    :class="cn(
      'bg-muted relative flex min-h-0 min-w-0 w-full flex-1 flex-col',
      'lg:peer-data-[variant=inset]:m-2 lg:peer-data-[variant=inset]:ml-0 lg:peer-data-[variant=inset]:rounded-xl lg:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
