<script setup lang="ts">
import { computed } from 'vue'
import {
  productIconAccentTileClass,
  productIconGlyphClass,
  productIcons,
  productIconSolidTileClass,
  type ProductIconKey,
  type ProductIconVariant,
} from './app-sidebar-nav-product-icons'
import { cn } from '@lib/utils'

const props = withDefaults(defineProps<{
  icon: ProductIconKey
  variant?: ProductIconVariant
  /** Плитка с фоном (solid/accent). `false` — только глиф, если фон уже на родителе. */
  tile?: boolean
  class?: string
}>(), {
  variant: 'solid',
  tile: undefined,
})

const markup = computed(() => productIcons[props.variant][props.icon])

const showTile = computed(() => {
  if (props.variant === 'default') return false
  return props.tile ?? true
})

const glyphClass = computed(() => productIconGlyphClass[props.icon])

const solidTileClass = computed(() => productIconSolidTileClass[props.icon])

const accentTileClass = computed(() => productIconAccentTileClass[props.icon])

const wrapperClass = computed(() => {
  const sizeClass = props.variant === 'default' ? 'size-7' : 'size-8'

  if (props.variant === 'accent' && showTile.value) {
    return cn(
      'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md',
      sizeClass,
      accentTileClass.value,
      '[&_svg]:size-full [&_svg]:block',
      props.class,
    )
  }

  if (props.variant === 'solid' && showTile.value) {
    return cn(
      'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md',
      sizeClass,
      solidTileClass.value,
      glyphClass.value,
      '[&_svg]:size-full [&_svg]:block',
      props.class,
    )
  }

  return cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden',
    sizeClass,
    glyphClass.value,
    '[&_svg]:size-full [&_svg]:block',
    props.class,
  )
})
</script>

<template>
  <span
    :class="wrapperClass"
    aria-hidden="true"
    v-html="markup"
  />
</template>
