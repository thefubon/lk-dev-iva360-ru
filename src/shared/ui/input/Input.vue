<script setup lang="ts">
import type { Component, HTMLAttributes } from "vue"
import { computed, nextTick, ref, useAttrs, useSlots } from "vue"
import { useVModel } from "@vueuse/core"
import { vMaska } from "maska/vue"
import { RU_PHONE_INPUT_MASK } from "@/shared/lib/ru-phone-input-mask"
import { cn } from '@lib/utils'
import type { InputVariants } from "."
import { inputVariants } from "."

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  variant?: InputVariants["variant"]
  size?: InputVariants["size"]
  state?: "default" | "error" | "warning" | "success"
  iconLeft?: Component
  iconRight?: Component
  iconRightInteractive?: boolean
  iconRightAriaLabel?: string
  mask?: string
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
  (e: "iconRightClick"): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const attrs = useAttrs()
const slots = useSlots()

/** Для `type="tel"` по умолчанию — российский номер; иначе только явный `mask`. */
const telMaskaOptions = { mask: RU_PHONE_INPUT_MASK, eager: true } as const

const maskaBinding = computed(() => {
  if (props.mask != null && props.mask !== "") return props.mask
  if (props.mask === "") return undefined
  if (attrs.type === "tel") return telMaskaOptions
  return undefined
})

const isInvalid = computed(() => {
  const v = attrs["aria-invalid"]
  if (v === "" || v === true) return true
  if (typeof v === "string") return v === "true"
  return false
})

const hasLeft = computed(() => Boolean(slots.iconLeft || props.iconLeft))
const hasRight = computed(() => Boolean(slots.iconRight || props.iconRight))

const hasValue = computed(() => {
  const v = modelValue.value
  if (v == null) return false
  return String(v).length > 0
})

const visualState = computed<"default" | "error" | "warning" | "success">(() => {
  if (isInvalid.value) return "error"
  if (props.state === "warning" || props.state === "success" || props.state === "error") return props.state
  return "default"
})

const stateToneClass = computed(() => {
  if (visualState.value === "error") return "text-destructive"
  if (visualState.value === "warning") return "text-warning"
  if (visualState.value === "success") return "text-primary"
  return ""
})

const iconToneClass = computed(() => {
  if (stateToneClass.value) return stateToneClass.value
  if (hasValue.value) return "text-foreground"
  return props.variant === "secondary" ? "text-secondary" : "text-text-placeholder"
})

const inputEl = ref<HTMLInputElement | null>(null)

async function onIconRightClick() {
  emits("iconRightClick")
  await nextTick()
  inputEl.value?.focus()
}
</script>

<template>
  <div class="group relative w-full min-w-0">
    <span
      v-if="hasLeft"
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
      :class="cn(
        iconToneClass,
        'group-focus-within:text-foreground',
        'group-active:text-foreground',
        isInvalid && 'text-destructive',
        Boolean(attrs.disabled) && 'opacity-50',
      )"
      aria-hidden="true"
    >
      <slot name="iconLeft">
        <component :is="props.iconLeft" v-if="props.iconLeft" class="size-4" />
      </slot>
    </span>

    <input
      v-maska="maskaBinding"
      v-bind="attrs"
      v-model="modelValue"
      ref="inputEl"
      data-slot="input"
      :data-variant="variant"
      :data-size="size"
      :data-state="visualState !== 'default' ? visualState : undefined"
      :class="cn(
        inputVariants({ variant, size }),
        hasLeft && 'pl-9',
        hasRight && 'pr-9',
        props.class,
      )"
    >

    <button
      v-if="hasRight && props.iconRightInteractive"
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
      :class="cn(
        iconToneClass,
        'group-focus-within:text-foreground',
        'group-active:text-foreground',
        isInvalid && 'text-destructive',
        Boolean(attrs.disabled) && 'opacity-50',
      )"
      :aria-label="props.iconRightAriaLabel ?? 'Toggle'"
      :disabled="Boolean(attrs.disabled)"
      tabindex="-1"
      @click="onIconRightClick"
    >
      <slot name="iconRight">
        <component :is="props.iconRight" v-if="props.iconRight" class="size-4" />
      </slot>
    </button>

    <span
      v-else-if="hasRight"
      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      :class="cn(
        iconToneClass,
        'group-focus-within:text-foreground',
        'group-active:text-foreground',
        isInvalid && 'text-destructive',
        Boolean(attrs.disabled) && 'opacity-50',
      )"
      aria-hidden="true"
    >
      <slot name="iconRight">
        <component :is="props.iconRight" v-if="props.iconRight" class="size-4" />
      </slot>
    </span>
  </div>
</template>
