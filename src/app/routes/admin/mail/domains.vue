<script setup lang="ts">
import { AdminMailDomainsPage } from '~/pages/admin-mail'

useSeoMeta({
  title: 'Домены — Почта',
  description:
    'Управление почтовыми доменами, DNS-записями и политиками в административном интерфейсе IWA 360.',
})
</script>

<template>
  <AdminMailDomainsPage />
</template>
