<script setup lang="ts">
import { cn } from '@lib/utils'
import { normalizeAppPath } from '@lib/app-mode-routes'

export type AdminRouteSubnavItem = {
  label: string
  href: string
}

const props = defineProps<{
  items: AdminRouteSubnavItem[]
  ariaLabel: string
}>()

const route = useRoute()

function isRouteActive(href: string): boolean {
  return normalizeAppPath(route.path) === normalizeAppPath(href)
}
</script>

<template>
  <nav
    class="relative flex items-end gap-2 border-b border-border"
    :aria-label="props.ariaLabel"
  >
    <NuxtLink
      v-for="item in props.items"
      :key="item.href"
      :to="item.href"
      class="inline-flex w-fit shrink-0 flex-col items-stretch gap-1 outline-none"
    >
      <span
        :class="cn(
          'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors',
          isRouteActive(item.href)
            ? 'bg-muted text-foreground'
            : 'text-foreground hover:bg-muted/60',
        )"
      >
        {{ item.label }}
      </span>
      <span
        aria-hidden="true"
        class="relative z-10 -mb-px h-0.5 shrink-0 rounded-full transition-colors"
        :class="isRouteActive(item.href) ? 'bg-primary' : 'bg-transparent'"
      />
    </NuxtLink>
  </nav>
</template>
