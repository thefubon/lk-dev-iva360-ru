<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
import { cn } from '@lib/utils'

const props = withDefaults(defineProps<PrimitiveProps & {
  showOnHover?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  as: "button",
})
</script>

<template>
  <Primitive
    data-slot="sidebar-menu-action"
    data-sidebar="menu-action"
    :class="cn(
      'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground-hover peer-hover/menu-button:text-foreground-hover absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform [&>svg]:size-4 [&>svg]:shrink-0',
      'after:absolute after:-inset-2 lg:after:hidden',
      'peer-data-[size=sm]/menu-button:top-1',
      'peer-data-[size=default]/menu-button:top-1.5',
      'peer-data-[size=lg]/menu-button:top-2.5',
      'group-data-[collapsible=icon]/sidebar:hidden',
      showOnHover
        && 'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 lg:opacity-0',
      props.class,
    )"
    :as="as"
    :as-child="asChild"
  >
    <slot />
  </Primitive>
</template>
