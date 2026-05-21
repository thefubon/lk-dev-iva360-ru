export const ADMIN_ROUTE_PREFIX = '/admin'

/** Keep in sync with the first item in `navMenuConfig`. */
export const DEFAULT_USER_ROUTE = '/'

/** Keep in sync with the first item in `adminNavMenuConfig`. */
export const DEFAULT_ADMIN_ROUTE = ADMIN_ROUTE_PREFIX

/** Normalizes an app path: leading slash, no trailing slash (except root). */
export function normalizeAppPath(path: string | undefined | null): string {
  let p = (path ?? '').trim()
  if (!p) return '/'
  if (!p.startsWith('/')) p = `/${p}`
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

export function isAdminRoute(path: string | undefined | null): boolean {
  const p = normalizeAppPath(path)
  return p === ADMIN_ROUTE_PREFIX || p.startsWith(`${ADMIN_ROUTE_PREFIX}/`)
}

/** Removes `/admin` prefix; `/admin` becomes `/`. */
export function stripAdminPrefix(path: string | undefined | null): string {
  const p = normalizeAppPath(path)
  if (p === ADMIN_ROUTE_PREFIX) return '/'
  if (p.startsWith(`${ADMIN_ROUTE_PREFIX}/`)) {
    const stripped = p.slice(ADMIN_ROUTE_PREFIX.length)
    return stripped || '/'
  }
  return p
}

/** Adds `/admin` prefix unless already present. Root `/` becomes `/admin`. */
export function addAdminPrefix(path: string | undefined | null): string {
  const p = normalizeAppPath(path)
  if (isAdminRoute(p)) return p
  if (p === '/') return ADMIN_ROUTE_PREFIX
  return `${ADMIN_ROUTE_PREFIX}${p}`
}

export function toAdminRoute(path: string | undefined | null): string {
  return addAdminPrefix(stripAdminPrefix(path))
}

export function toUserRoute(path: string | undefined | null): string {
  return stripAdminPrefix(path)
}

export function pathsEqual(a: string | undefined | null, b: string | undefined | null): boolean {
  return normalizeAppPath(a) === normalizeAppPath(b)
}
