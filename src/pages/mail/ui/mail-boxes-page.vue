<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Почтовые ящики',
  description: 'Почта IVA 360 — ящики.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Почтовые ящики"
    description="Раздел личного кабинета. Почта и календарь — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/mail`"
  />
</template>
