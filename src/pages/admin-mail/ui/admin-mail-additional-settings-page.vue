<script setup lang="ts">
import { computed } from 'vue'
import {
  DEFAULT_MAIL_ADDITIONAL_SECTION,
  MAIL_ADDITIONAL_SECTION_DESCRIPTIONS,
  MAIL_ADDITIONAL_SECTION_LABELS,
  MAIL_ADDITIONAL_SECTIONS,
  sectionFromQuery,
  type MailAdditionalSection,
} from '@lib/mail/mail-additional-settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { AdminPageSection } from '@/widgets/admin-page-section'
import MailGroupsTab from './mail-groups-tab.vue'
import MailQueueTab from './mail-queue-tab.vue'
import MailRulesTab from './mail-rules-tab.vue'
import MailSyncTab from './mail-sync-tab.vue'

const route = useRoute()
const router = useRouter()

const activeSection = computed({
  get: () => sectionFromQuery(route.query.section),
  set: (section: MailAdditionalSection) => {
    const query = { ...route.query }
    if (section === DEFAULT_MAIL_ADDITIONAL_SECTION) {
      delete query.section
    } else {
      query.section = section
    }
    void router.replace({ query })
  },
})

const tabTriggerClass =
  'group/trigger inline-flex h-auto shrink-0 flex-none flex-col items-stretch gap-1 whitespace-nowrap rounded-none border-0 bg-transparent p-0 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0'

const tabsNavScrollClass =
  '-mx-4 min-w-0 overflow-x-auto overflow-y-hidden px-4 scroll-smooth scrollbar-none sm:mx-0 sm:px-0'

const tabsListClass =
  'inline-flex h-auto w-max flex-nowrap gap-2 rounded-none bg-transparent p-0'

const tabLabelClass =
  'inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors text-foreground group-data-[state=active]/trigger:bg-muted group-data-[state=inactive]/trigger:hover:bg-muted/60'

const tabIndicatorClass =
  'relative z-10 -mb-px h-0.5 shrink-0 rounded-full bg-transparent transition-colors group-data-[state=active]/trigger:bg-primary'
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Почта
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Дополнительные настройки: группы рассылки, общие ящики, правила, синхронизация и очередь
      </p>
    </header>

    <AdminPageSection class="min-w-0 p-3 sm:p-4">
      <Tabs
        v-model="activeSection"
        class="min-w-0 gap-6"
      >
        <nav
          class="relative min-w-0 border-b border-border"
          aria-label="Дополнительные настройки почты"
        >
          <div :class="tabsNavScrollClass">
            <TabsList :class="tabsListClass">
              <TabsTrigger
                v-for="section in MAIL_ADDITIONAL_SECTIONS"
                :key="section"
                :value="section"
                :class="tabTriggerClass"
              >
                <span :class="tabLabelClass">
                  {{ MAIL_ADDITIONAL_SECTION_LABELS[section] }}
                </span>
                <span
                  aria-hidden="true"
                  :class="tabIndicatorClass"
                />
              </TabsTrigger>
            </TabsList>
          </div>
        </nav>

        <TabsContent
          value="groups"
          class="mt-0"
        >
          <p class="text-muted-foreground mb-4 text-sm leading-relaxed">
            {{ MAIL_ADDITIONAL_SECTION_DESCRIPTIONS.groups }}
          </p>
          <MailGroupsTab />
        </TabsContent>

        <TabsContent
          value="rules"
          class="mt-0"
        >
          <p class="text-muted-foreground mb-4 text-sm leading-relaxed">
            {{ MAIL_ADDITIONAL_SECTION_DESCRIPTIONS.rules }}
          </p>
          <MailRulesTab />
        </TabsContent>

        <TabsContent
          value="caldav"
          class="mt-0"
        >
          <p class="text-muted-foreground mb-4 text-sm leading-relaxed">
            {{ MAIL_ADDITIONAL_SECTION_DESCRIPTIONS.caldav }}
          </p>
          <MailSyncTab />
        </TabsContent>

        <TabsContent
          value="queue"
          class="mt-0"
        >
          <p class="text-muted-foreground mb-4 text-sm leading-relaxed">
            {{ MAIL_ADDITIONAL_SECTION_DESCRIPTIONS.queue }}
          </p>
          <MailQueueTab />
        </TabsContent>
      </Tabs>
    </AdminPageSection>
  </main>
</template>
