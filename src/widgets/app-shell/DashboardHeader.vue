<script setup lang="ts">
import avatarUserUrl from '@app/assets/img/avatar-user.png?url'
import { ChevronDown, ShoppingCart } from 'lucide-vue-next'
import { Button } from '@/shared/ui/button'
import { SidebarTrigger } from '@/shared/ui/sidebar'
import { cn } from '@lib/utils'
import AppModeToggle from './AppModeToggle.vue'
</script>

<template>
  <header
    :class="cn(
      'sticky top-0 z-40',
      'flex h-16 shrink-0 items-center justify-between border-b border-border',
      'bg-background pl-2 pr-4',
    )"
  >
    <div class="flex min-w-0 items-center gap-3">
      <SidebarTrigger
        class="h-9 w-9 shrink-0 rounded-lg [&_svg]:size-4.5!"
      />
      <AppModeToggle />
    </div>
    <div class="flex shrink-0 items-center gap-2 sm:gap-4">
      <Button
        variant="outline"
        type="button"
        aria-label="Корзина"
        class="gap-2 rounded-lg px-2 md:px-4 has-[>svg]:px-2 md:has-[>svg]:px-4"
      >
        <ShoppingCart class="size-5 shrink-0" />
        <span class="hidden md:inline">Корзина</span>
      </Button>
      <Button
        variant="ghost"
        type="button"
        class="h-9 shrink-0 gap-0 rounded-lg px-1 hover:bg-transparent dark:hover:bg-transparent"
        aria-label="Профиль"
      >
        <span
          class="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
        >
          <img
            :src="avatarUserUrl"
            alt=""
            class="size-full object-cover"
            width="36"
            height="36"
            loading="lazy"
            decoding="async"
          >
        </span>
        <span class="text-muted-foreground flex size-6 shrink-0 items-center justify-center">
          <ChevronDown class="size-5" />
        </span>
      </Button>
    </div>
  </header>
</template>
