<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Настройки SSO',
  description: 'Интеграции IVA 360 — SSO.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Настройки SSO"
    description="Раздел личного кабинета. Настройка SSO — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/integration/sso`"
  />
</template>
