<script setup lang="ts">
import { UsersProductsPage } from '~/pages/users'

useSeoMeta({
  title: 'Мои продукты',
  description:
    'Подключённые продукты и подписки в разделе «Подписки и заказы» личного кабинета IWA 360.',
})
</script>

<template>
  <UsersProductsPage billing />
</template>
