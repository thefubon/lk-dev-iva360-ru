<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Комнаты',
  description: 'Комнаты для встреч IVA 360.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Комнаты"
    description="Раздел личного кабинета. Управление комнатами — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/rooms`"
  />
</template>
