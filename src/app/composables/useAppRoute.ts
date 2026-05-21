import { computed } from 'vue'
import { addAdminPrefix, isAdminRoute, stripAdminPrefix } from '@lib/app-mode-routes'

/**
 * Resolves app links for the current panel (user vs admin route trees).
 */
export function useAppRoute() {
  const route = useRoute()

  function appPath(basePath: string): string {
    return isAdminRoute(route.path) ? addAdminPrefix(basePath) : stripAdminPrefix(basePath)
  }

  function isAppPathActive(basePath: string): boolean {
    return stripAdminPrefix(route.path) === stripAdminPrefix(basePath)
  }

  return {
    isAdminRoute: computed(() => isAdminRoute(route.path)),
    appPath,
    isAppPathActive,
  }
}
