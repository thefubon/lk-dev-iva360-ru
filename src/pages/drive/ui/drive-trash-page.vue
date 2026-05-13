<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Корзина',
  description: 'Корзина диска IVA 360.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Корзина"
    description="Раздел личного кабинета. Удалённые файлы — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/drive/trash`"
  />
</template>
