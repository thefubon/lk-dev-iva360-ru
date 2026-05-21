<script setup lang="ts">
import { UsersEmployeesPage } from '~/pages/users'

useSeoMeta({
  title: 'Управление сотрудниками',
  description:
    'Список сотрудников IWA 360: добавление и CSV-импорт, отделы, роли, теги, подписки и права доступа; поиск, фильтры, колонки таблицы.',
})
</script>

<template>
  <UsersEmployeesPage />
</template>
