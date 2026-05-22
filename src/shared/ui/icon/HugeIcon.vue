<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { IconArray } from '@hugeicons/vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { cn } from '@lib/utils'

const props = withDefaults(
  defineProps<{
    icon: IconArray
    altIcon?: IconArray
    showAlt?: boolean
    size?: number | string
    color?: string
    strokeWidth?: number
    absoluteStrokeWidth?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    size: 20,
    color: 'currentColor',
    strokeWidth: 1.5,
    showAlt: false,
    absoluteStrokeWidth: false,
  },
)
</script>

<template>
  <HugeiconsIcon
    :icon="props.icon"
    :alt-icon="props.altIcon"
    :show-alt="props.showAlt"
    :size="props.size"
    :color="props.color"
    :stroke-width="props.strokeWidth"
    :absolute-stroke-width="props.absoluteStrokeWidth"
    :class="cn('shrink-0', props.class)"
  />
</template>
