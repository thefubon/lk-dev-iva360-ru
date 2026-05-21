<script setup lang="ts">
import { cn } from '@lib/utils'

const { appPath, isAppPathActive } = useAppRoute()
</script>

<template>
  <nav
    class="relative flex items-end gap-2 border-b border-border"
    aria-label="Подраздел: подписки и заказы"
  >
    <NuxtLink
      :to="appPath('/billing/products')"
      class="inline-flex w-fit shrink-0 flex-col items-stretch gap-1 outline-none"
    >
      <span
        :class="cn(
          'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors',
          isAppPathActive('/billing/products')
            ? 'bg-muted text-foreground'
            : 'text-foreground hover:bg-muted/60',
        )"
      >
        Мои продукты
      </span>
      <span
        aria-hidden="true"
        class="relative z-10 -mb-px h-0.5 shrink-0 rounded-full transition-colors"
        :class="isAppPathActive('/billing/products') ? 'bg-primary' : 'bg-transparent'"
      />
    </NuxtLink>
    <NuxtLink
      :to="appPath('/billing/orders')"
      class="inline-flex w-fit shrink-0 flex-col items-stretch gap-1 outline-none"
    >
      <span
        :class="cn(
          'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors',
          isAppPathActive('/billing/orders')
            ? 'bg-muted text-foreground'
            : 'text-foreground hover:bg-muted/60',
        )"
      >
        Мои заказы
      </span>
      <span
        aria-hidden="true"
        class="relative z-10 -mb-px h-0.5 shrink-0 rounded-full transition-colors"
        :class="isAppPathActive('/billing/orders') ? 'bg-primary' : 'bg-transparent'"
      />
    </NuxtLink>
  </nav>
</template>
