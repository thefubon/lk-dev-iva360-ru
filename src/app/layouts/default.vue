<script setup lang="ts">
import { SidebarInset, SidebarProvider } from '@/shared/ui/sidebar'
import AppSidebar from '~/widgets/app-shell/AppSidebar.vue'
import DashboardHeader from '~/widgets/app-shell/DashboardHeader.vue'
</script>

<template>
  <SidebarProvider class="min-h-svh flex-1">
    <AppSidebar />
    <SidebarInset>
      <DashboardHeader />
      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
