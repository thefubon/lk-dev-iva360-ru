<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'

useSeoMeta({
  title: 'Мои файлы',
  description: 'Диск IVA 360 — мои файлы.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Мои файлы"
    description="Раздел личного кабинета. Работа с файлами — в продукте «Диск» IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/drive`"
  />
</template>
