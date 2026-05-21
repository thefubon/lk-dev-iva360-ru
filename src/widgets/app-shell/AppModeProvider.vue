<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  DEFAULT_ADMIN_ROUTE,
  DEFAULT_USER_ROUTE,
  isAdminRoute,
} from '@lib/app-mode-routes'
import {
  APP_MODE_STORAGE_KEY,
  provideAppModeContext,
  type AppMode,
} from '@lib/use-app-mode'

const route = useRoute()

function readInitialMode(): AppMode {
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(APP_MODE_STORAGE_KEY)
      if (stored === 'admin' || stored === 'user') return stored
    } catch {
      /* keep route-derived mode */
    }
  }

  return isAdminRoute(route.path) ? 'admin' : 'user'
}

const mode = ref<AppMode>(readInitialMode())

onMounted(() => {
  if (mode.value === 'admin' && !isAdminRoute(route.path)) {
    navigateTo(DEFAULT_ADMIN_ROUTE, { replace: true })
    return
  }

  if (mode.value === 'user' && isAdminRoute(route.path)) {
    navigateTo(DEFAULT_USER_ROUTE, { replace: true })
  }
})

watch(mode, (value) => {
  try {
    localStorage.setItem(APP_MODE_STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
})

const isAdminMode = computed(() => mode.value === 'admin')

function setMode(next: AppMode) {
  if (next === mode.value) return

  mode.value = next
  const target = next === 'admin' ? DEFAULT_ADMIN_ROUTE : DEFAULT_USER_ROUTE
  navigateTo(target)
}

provideAppModeContext({
  mode,
  isAdminMode,
  setMode,
})
</script>

<template>
  <slot />
</template>
