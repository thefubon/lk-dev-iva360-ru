<script setup lang="ts">
import { AdminPageSection } from '@/widgets/admin-page-section'
import MailDomainsListSection from './mail-domains-list-section.vue'
import MailPoliciesSection from './mail-policies-section.vue'
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header
      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="flex min-w-0 flex-col gap-2">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          Почта
        </h1>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Почтовые домены, DNS-записи и политики доставки
        </p>
      </div>

      <span
        class="inline-flex w-fit shrink-0 items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
        role="status"
      >
        <span
          class="inline-flex size-2 rounded-full bg-primary"
          aria-hidden="true"
        />
        Online
      </span>
    </header>

    <AdminPageSection>
      <MailDomainsListSection />
    </AdminPageSection>

    <AdminPageSection>
      <MailPoliciesSection />
    </AdminPageSection>
  </main>
</template>
