<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, inject, useAttrs } from "vue"
import { NumberFieldInput } from "reka-ui"
import { cn } from '@lib/utils'
import { numberFieldSizeKey, numberFieldStateKey, numberFieldVariantKey } from "./context"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const attrs = useAttrs()

const isInvalid = computed(() => {
  const v = attrs["aria-invalid"]
  if (v === "" || v === true) return true
  if (typeof v === "string") return v === "true"
  return false
})

const size = inject(numberFieldSizeKey, computed(() => "default"))
const variant = inject(numberFieldVariantKey, computed(() => "primary"))
const state = inject(numberFieldStateKey, computed(() => "default"))

const visualState = computed(() => {
  if (isInvalid.value) return "error"
  return state.value
})

const sizeClass = computed(() => {
  // Минимальные ширины нужны, чтобы поле не сжималось слишком сильно на мобильных.
  if (size.value === "sm") return "h-8 text-sm min-w-24"
  if (size.value === "lg") return "h-10 text-base min-w-32"
  return "h-9 text-sm min-w-28"
})

const variantClass = computed(() => {
  // Поведение как у `Input` (см. `app/components/ui/input/index.ts`), но упрощённо (без `ring`/`shadow`).
  if (variant.value === "secondary")
    return "border-border bg-muted placeholder:text-secondary hover:bg-background hover:border-primary focus-visible:bg-background focus-visible:border-primary active:bg-background active:border-primary disabled:hover:bg-muted disabled:hover:border-border disabled:focus-visible:bg-muted disabled:focus-visible:border-border disabled:active:bg-muted disabled:active:border-border"
  return "border-input hover:border-primary focus-visible:border-primary active:border-primary disabled:hover:border-input disabled:focus-visible:border-input disabled:active:border-input"
})

const stateClass = computed(() => {
  if (visualState.value === "error")
    return "border-destructive text-destructive placeholder:text-destructive/70"
  if (visualState.value === "warning")
    return "border-warning text-warning placeholder:text-warning/70"
  if (visualState.value === "success")
    return "border-primary text-primary placeholder:text-primary/70"
  return ""
})
</script>

<template>
  <NumberFieldInput
    data-slot="input"
    :data-variant="variant"
    :data-size="size"
    :data-state="visualState !== 'default' ? visualState : undefined"
    :class="cn('flex w-full rounded-md border py-1 text-center tabular-nums transition-colors duration-200 focus-visible:outline-none disabled:opacity-50', variantClass, stateClass, sizeClass, props.class)"
  />
</template>
