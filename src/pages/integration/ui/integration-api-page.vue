<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Настройки API',
  description: 'Интеграции IVA 360 — API.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Настройки API"
    description="Раздел личного кабинета. Настройка API выполняется в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/integration/api`"
  />
</template>
