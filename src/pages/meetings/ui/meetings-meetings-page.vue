<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Встречи',
  description: 'Встречи в IVA 360: переход в продукт для планирования и проведения встреч.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Встречи"
    description="Раздел личного кабинета. Управление встречами выполняется в продукте IVA 360 — откройте сервис в новой вкладке."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/meetings`"
  />
</template>
