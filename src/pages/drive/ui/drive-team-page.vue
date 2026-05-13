<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Корпоративное пространство',
  description: 'Корпоративное пространство на диске IVA 360.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Корпоративное пространство"
    description="Раздел личного кабинета. Корпоративные файлы — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/drive/team`"
  />
</template>
