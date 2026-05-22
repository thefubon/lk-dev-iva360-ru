<script setup lang="ts">
import { cn } from '@lib/utils'
import logoSrc from '@app/assets/img/logo.svg'

const props = defineProps<{
  class?: string
  isAdmin?: boolean
}>()
</script>

<template>
  <div
    :class="cn(
      'flex min-w-0 items-center gap-3',
      props.class,
    )"
  >
    <img
      :src="logoSrc"
      alt="IVA 360"
      width="114"
      height="40"
      class="pointer-events-none h-10 w-auto shrink-0 select-none"
      draggable="false"
    />
    <div class="flex min-w-0 flex-col group-data-[collapsible=icon]/sidebar:hidden">
      <p class="mb-0 text-sm font-medium leading-[1.1] text-foreground">
        Панель
      </p>
      <p class="text-sm font-medium leading-[1.1] text-foreground">
        {{ props.isAdmin ? 'Администратора' : 'управления' }}
      </p>
    </div>
  </div>
</template>
