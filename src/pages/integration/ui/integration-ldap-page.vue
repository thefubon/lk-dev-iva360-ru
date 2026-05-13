<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Настройки LDAP',
  description: 'Интеграции IVA 360 — LDAP.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Настройки LDAP"
    description="Раздел личного кабинета. Настройка LDAP — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/integration/ldap`"
  />
</template>
