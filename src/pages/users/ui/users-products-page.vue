<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@lib/utils'
import BillingSubscriptionsSubnav from '~/pages/billing/ui/billing-subscriptions-subnav.vue'

const props = withDefaults(
  defineProps<{
    /** Страница открыта из «Подписки и заказы», а не из «Пользователи». */
    billing?: boolean
  }>(),
  { billing: false },
)

const EMPLOYEES_PATH = '/users/employees'
const PRODUCTS_PATH_USERS = '/users/products'

const route = useRoute()

const isBillingProductsContext = computed(() => props.billing)

const subNavAriaLabel = 'Подраздел пользователей'

const introText = computed(() =>
  isBillingProductsContext.value
    ? 'Раздел «Подписки и заказы» → «Мои продукты». Здесь будет управление продуктами и доступами.'
    : 'Раздел «Пользователи» → «Продукты». Здесь будет управление продуктами и доступами.',
)
</script>

<template>
  <main class="container mx-auto flex min-h-0 flex-1 flex-col gap-4 px-6 py-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        {{ isBillingProductsContext ? 'Мои продукты' : 'Продукты' }}
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        {{ introText }}
      </p>
    </header>

    <div
      class="flex flex-col gap-4 rounded-xl bg-background"
    >
      <BillingSubscriptionsSubnav v-if="isBillingProductsContext" />
      <nav
        v-else
        class="relative flex items-end gap-2 border-b border-border"
        :aria-label="subNavAriaLabel"
      >
        <NuxtLink
          :to="EMPLOYEES_PATH"
          class="inline-flex w-fit shrink-0 flex-col items-stretch gap-1 outline-none"
        >
          <span
            :class="cn(
              'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors',
              route.path === EMPLOYEES_PATH
                ? 'bg-muted text-foreground'
                : 'text-foreground hover:bg-muted/60',
            )"
          >
            Сотрудники
          </span>
          <span
            aria-hidden="true"
            class="relative z-10 -mb-px h-0.5 shrink-0 rounded-full transition-colors"
            :class="route.path === EMPLOYEES_PATH ? 'bg-primary' : 'bg-transparent'"
          />
        </NuxtLink>
        <NuxtLink
          :to="PRODUCTS_PATH_USERS"
          class="inline-flex w-fit shrink-0 flex-col items-stretch gap-1 outline-none"
        >
          <span
            :class="cn(
              'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors',
              route.path === PRODUCTS_PATH_USERS
                ? 'bg-muted text-foreground'
                : 'text-foreground hover:bg-muted/60',
            )"
          >
            Управление подписками
          </span>
          <span
            aria-hidden="true"
            class="relative z-10 -mb-px h-0.5 shrink-0 rounded-full transition-colors"
            :class="route.path === PRODUCTS_PATH_USERS ? 'bg-primary' : 'bg-transparent'"
          />
        </NuxtLink>
      </nav>
    </div>
  </main>
</template>
