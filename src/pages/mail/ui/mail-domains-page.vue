<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Почтовые домены',
  description: 'Почтовые домены IVA 360.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Почтовые домены"
    description="Раздел личного кабинета. Управление доменами — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/mail/domains`"
  />
</template>
