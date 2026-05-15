<script setup lang="ts">
import { computed } from 'vue'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@lib/utils'

const MAX_VISIBLE_TAGS = 2

const props = defineProps<{
  value: string
}>()

const tags = computed(() => {
  const raw = props.value.trim()
  if (!raw || raw === '—') return []
  return raw.split(/[,;]+/).map((t) => t.trim()).filter(Boolean)
})

const display = computed(() => {
  const list = tags.value
  if (list.length === 0) {
    return { visible: '—', overflow: 0 }
  }
  if (list.length <= MAX_VISIBLE_TAGS) {
    return { visible: list.join(', '), overflow: 0 }
  }
  return {
    visible: `${list.slice(0, MAX_VISIBLE_TAGS).join(', ')}…`,
    overflow: list.length - MAX_VISIBLE_TAGS,
  }
})

const showTooltip = computed(() => display.value.overflow > 0)
const tooltipText = computed(() => tags.value.join(', '))
</script>

<template>
  <Tooltip :disabled="!showTooltip">
    <TooltipTrigger as-child>
      <span
        class="flex min-w-0 max-w-full items-center gap-1 text-left"
        :tabindex="showTooltip ? 0 : undefined"
      >
        <span
          class="min-w-0 truncate text-foreground text-sm leading-tight"
          :title="showTooltip ? undefined : display.visible"
        >
          {{ display.visible }}
        </span>
        <span
          v-if="display.overflow > 0"
          class="text-muted-foreground shrink-0 text-xs font-medium tabular-nums leading-tight"
        >
          +{{ display.overflow }}
        </span>
      </span>
    </TooltipTrigger>
    <TooltipContent
      side="top"
      align="start"
      variant="light"
      :class="cn('max-w-56 px-2.5 py-2 text-xs leading-snug')"
    >
      <p class="text-foreground wrap-break-word whitespace-normal">
        {{ tooltipText }}
      </p>
    </TooltipContent>
  </Tooltip>
</template>
