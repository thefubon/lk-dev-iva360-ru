<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { PanelLeftOpenIcon } from '@hugeicons/core-free-icons'
import { cn } from '@lib/utils'
import { Button } from '@/shared/ui/button'
import { HugeIcon } from '@/shared/ui/icon'
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('[&_svg]:size-5!', props.class)"
    @click="toggleSidebar"
  >
    <HugeIcon :icon="PanelLeftOpenIcon" :size="20" class="shrink-0" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
