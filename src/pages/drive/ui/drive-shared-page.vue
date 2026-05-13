<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Есть доступ',
  description: 'Файлы, к которым у вас есть доступ, IVA 360.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Есть доступ"
    description="Раздел личного кабинета. Общие и расшаренные материалы — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/drive/shared`"
  />
</template>
