<script setup lang="ts">
import { ProfilePage } from '~/pages/profile'

useSeoMeta({
  title: 'Профиль',
  description:
    'Личный профиль пользователя IWA 360: имя, контакты и параметры учётной записи.',
})
</script>

<template>
  <ProfilePage />
</template>
