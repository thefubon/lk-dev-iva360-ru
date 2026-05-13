<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Вебинары',
  description: 'Вебинары IVA 360: переход в продукт.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Вебинары"
    description="Раздел личного кабинета. Вебинары проводятся в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/webinars`"
  />
</template>
