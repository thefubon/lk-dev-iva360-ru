<script setup lang="ts">
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import ProductHubRoutePage from '@/widgets/app-shell/ui/product-hub-route-page.vue'
import BillingSubscriptionsSubnav from './billing-subscriptions-subnav.vue'

useSeoMeta({
  title: 'Мои заказы',
  description: 'Заказы в IVA 360.',
})
</script>

<template>
  <ProductHubRoutePage
    title="Мои заказы"
    description="Раздел «Подписки и заказы». Оформление и история заказов — в продукте IVA 360."
    :product-url="`${IVA360_PRODUCT_ORIGIN}/orders`"
  >
    <template #prepend>
      <BillingSubscriptionsSubnav class="pb-2" />
    </template>
  </ProductHubRoutePage>
</template>
