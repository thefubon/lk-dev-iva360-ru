import {
  DEFAULT_ADMIN_ROUTE,
  DEFAULT_USER_ROUTE,
  isAdminRoute,
} from '@lib/app-mode-routes'
import { APP_MODE_STORAGE_KEY, type AppMode } from '@lib/use-app-mode'

function readStoredMode(): AppMode | null {
  try {
    const value = localStorage.getItem(APP_MODE_STORAGE_KEY)
    if (value === 'admin' || value === 'user') return value
  } catch {
    /* ignore */
  }
  return null
}

function writeStoredMode(mode: AppMode) {
  try {
    localStorage.setItem(APP_MODE_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const onAdminRoute = isAdminRoute(to.path)
  const stored = readStoredMode()
  const effectiveMode: AppMode = stored ?? (onAdminRoute ? 'admin' : 'user')

  if (effectiveMode === 'admin' && !onAdminRoute) {
    writeStoredMode('admin')
    return navigateTo(DEFAULT_ADMIN_ROUTE, { replace: true })
  }

  if (effectiveMode === 'user' && onAdminRoute) {
    writeStoredMode('user')
    return navigateTo(DEFAULT_USER_ROUTE, { replace: true })
  }

  const routeMode: AppMode = onAdminRoute ? 'admin' : 'user'
  if (stored !== routeMode) writeStoredMode(routeMode)
})
