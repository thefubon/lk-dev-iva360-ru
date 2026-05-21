<script setup lang="ts">
import { Settings, User } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useAppMode, type AppMode } from '@lib/use-app-mode'

const { mode, setMode } = useAppMode()

function onModeChange(value: string | number) {
  if (value === 'user' || value === 'admin') {
    setMode(value satisfies AppMode)
  }
}
</script>

<template>
  <Tabs
    :model-value="mode"
    class="gap-0"
    aria-label="Режим интерфейса"
    @update:model-value="onModeChange"
  >
    <TabsList>
      <TabsTrigger
        value="user"
        aria-label="Пользователь"
        class="px-2 md:px-3 data-[state=active]:[&_svg]:text-primary dark:data-[state=active]:[&_svg]:text-primary"
      >
        <User class="size-4 shrink-0" />
        <span class="hidden md:inline">Пользователь</span>
      </TabsTrigger>
      <TabsTrigger
        value="admin"
        aria-label="Администратор"
        class="px-2 md:px-3 data-[state=active]:[&_svg]:text-primary dark:data-[state=active]:[&_svg]:text-primary"
      >
        <Settings class="size-4 shrink-0" />
        <span class="hidden md:inline">Администратор</span>
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
