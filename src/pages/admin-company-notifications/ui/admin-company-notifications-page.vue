<script setup lang="ts">
import {
  NOTIFICATION_TAB_LABELS,
  NOTIFICATION_TABS,
  type NotificationTab,
} from '@lib/notifications/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { AdminPageSection } from '@/widgets/admin-page-section'
import NotificationsChannelsTab from './notifications-channels-tab.vue'
import NotificationsListTab from './notifications-list-tab.vue'

const DEFAULT_NOTIFICATION_TAB: NotificationTab = 'channels'

function isNotificationTab(value: unknown): value is NotificationTab {
  return typeof value === 'string' && NOTIFICATION_TABS.includes(value as NotificationTab)
}

function tabFromQuery(queryTab: unknown): NotificationTab {
  return isNotificationTab(queryTab) ? queryTab : DEFAULT_NOTIFICATION_TAB
}

const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => tabFromQuery(route.query.tab),
  set: (tab: NotificationTab) => {
    const query = { ...route.query }
    if (tab === DEFAULT_NOTIFICATION_TAB) {
      delete query.tab
    } else {
      query.tab = tab
    }
    void router.replace({ query })
  },
})

const tabTriggerClass =
  'group/trigger inline-flex h-auto w-fit shrink-0 flex-col items-stretch gap-1 rounded-none border-0 bg-transparent p-0 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0'

const tabLabelClass =
  'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors text-foreground group-data-[state=active]/trigger:bg-muted group-data-[state=inactive]/trigger:hover:bg-muted/60'

const tabIndicatorClass =
  'relative z-10 -mb-px h-0.5 shrink-0 rounded-full bg-transparent transition-colors group-data-[state=active]/trigger:bg-primary'
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Уведомления
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Настройка каналов и правил доставки оповещений для администраторов.
      </p>
    </header>

    <AdminPageSection>
      <Tabs
        v-model="activeTab"
        class="gap-6"
      >
        <nav
          class="relative flex flex-wrap items-end gap-2 border-b border-border"
          aria-label="Разделы уведомлений"
        >
          <TabsList class="h-auto w-fit gap-2 rounded-none bg-transparent p-0">
            <TabsTrigger
              v-for="tab in NOTIFICATION_TABS"
              :key="tab"
              :value="tab"
              :class="tabTriggerClass"
            >
              <span :class="tabLabelClass">
                {{ NOTIFICATION_TAB_LABELS[tab] }}
              </span>
              <span
                aria-hidden="true"
                :class="tabIndicatorClass"
              />
            </TabsTrigger>
          </TabsList>
        </nav>

        <TabsContent
          value="channels"
          class="flex flex-col gap-4"
        >
          <NotificationsChannelsTab />
        </TabsContent>

        <TabsContent
          value="list"
          class="flex flex-col gap-4"
        >
          <NotificationsListTab />
        </TabsContent>
      </Tabs>
    </AdminPageSection>
  </main>
</template>
