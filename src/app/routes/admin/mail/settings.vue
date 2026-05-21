<script setup lang="ts">
import { AdminMailAdditionalSettingsPage } from '~/pages/admin-mail'

useSeoMeta({
  title: 'Дополнительные настройки — Почта',
  description:
    'Группы рассылки, правила фильтрации, очередь исходящих и синхронизация CalDAV / EAS в административном интерфейсе IVA 360.',
})
</script>

<template>
  <AdminMailAdditionalSettingsPage />
</template>
