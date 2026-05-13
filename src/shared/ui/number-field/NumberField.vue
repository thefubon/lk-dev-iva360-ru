<script setup lang="ts">
import type { NumberFieldRootEmits, NumberFieldRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed, provide } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { NumberFieldRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from '@lib/utils'
import type { NumberFieldSize, NumberFieldState, NumberFieldVariant } from "./context"
import { numberFieldSizeKey, numberFieldStateKey, numberFieldVariantKey } from "./context"

const props = defineProps<
  NumberFieldRootProps & {
    class?: HTMLAttributes["class"]
    size?: NumberFieldSize
    variant?: NumberFieldVariant
    state?: NumberFieldState
  }
>()
const emits = defineEmits<NumberFieldRootEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)

provide(numberFieldSizeKey, computed(() => props.size ?? "default"))
provide(numberFieldVariantKey, computed(() => props.variant ?? "primary"))
provide(numberFieldStateKey, computed(() => props.state ?? "default"))
</script>

<template>
  <NumberFieldRoot v-slot="slotProps" v-bind="forwarded" :class="cn('grid gap-1.5', props.class)">
    <slot v-bind="slotProps" />
  </NumberFieldRoot>
</template>
