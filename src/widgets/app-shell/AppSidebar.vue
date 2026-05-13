<script setup lang="ts">
import { Monitor } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/shared/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import AppSidebarNav from './AppSidebarNav.vue'
import Iva360Logo from './Iva360Logo.vue'

const { isMobile, state } = useSidebar()

function onInstallApp() {
  toast.message('Установить приложение', {
    description: 'Здесь будет сценарий установки PWA / десктоп-приложения.',
  })
}
</script>

<template>
  <Sidebar collapsible="offcanvas" side="left" variant="sidebar">
    <SidebarHeader
      class="flex h-16 shrink-0 flex-row items-center gap-0 p-0 px-4"
    >
      <div class="flex w-full min-w-0 items-center gap-3">
        <Iva360Logo class="min-w-0" />
      </div>
    </SidebarHeader>

    <SidebarContent class="gap-0">
      <AppSidebarNav />
    </SidebarContent>

    <SidebarFooter class="shrink-0 gap-2 p-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="w-full [&_svg]:size-4"
                @click="onInstallApp"
              >
                <Monitor />
                Установить приложение
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              :hidden="state !== 'collapsed' || isMobile"
            >
              Установить приложение
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
