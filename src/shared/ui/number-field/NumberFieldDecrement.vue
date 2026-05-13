<script setup lang="ts">
import type { NumberFieldDecrementProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed, inject } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Minus } from "lucide-vue-next"
import { NumberFieldDecrement, useForwardProps } from "reka-ui"
import { cn } from '@lib/utils'
import { numberFieldSizeKey } from "./context"

const props = defineProps<NumberFieldDecrementProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardProps(delegatedProps)

const size = inject(numberFieldSizeKey, computed(() => "default"))
const sizeClass = computed(() => {
  // Минимальная ширина нужна, чтобы кнопки не сжимались на мобильных.
  if (size.value === "sm") return "p-2 min-w-8"
  if (size.value === "lg") return "p-4 min-w-10"
  return "p-3 min-w-9"
})
</script>

<template>
  <NumberFieldDecrement
    data-slot="decrement"
    v-bind="forwarded"
    :class="cn('absolute top-1/2 -translate-y-1/2 left-0 flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:cursor-default', sizeClass, props.class)"
  >
    <slot>
      <Minus :class="cn('h-4 w-4', size === 'lg' && 'h-5 w-5')" />
    </slot>
  </NumberFieldDecrement>
</template>
