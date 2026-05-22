<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '@lib/utils'
import { ScrollArea } from '@/shared/ui/scroll-area'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="sidebar-content"
    data-sidebar="content"
    class="flex min-h-0 flex-1 flex-col"
  >
    <ScrollArea
      :class="cn(
        'min-h-0 flex-1',
        '[&_[data-slot=scroll-area-viewport]]:size-full',
        '[&_[data-slot=scroll-area-viewport>div]:!block',
        '[&_[data-slot=scroll-area-scrollbar]]:opacity-0',
        '[&_[data-slot=scroll-area-scrollbar]]:transition-opacity',
        'hover:[&_[data-slot=scroll-area-scrollbar]]:opacity-100',
        'group-data-[collapsible=icon]/sidebar:[&_[data-slot=scroll-area-viewport]]:overflow-hidden',
        'group-data-[collapsible=icon]/sidebar:[&_[data-slot=scroll-area-scrollbar]]:hidden',
      )"
    >
      <div :class="cn('flex flex-col gap-2', props.class)">
        <slot />
      </div>
    </ScrollArea>
  </div>
</template>
