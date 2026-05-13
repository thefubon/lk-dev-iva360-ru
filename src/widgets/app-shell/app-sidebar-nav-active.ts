import type { SidebarNavEntry } from './app-sidebar-nav.config'

/** Нормализует pathname из vue-router для сопоставления с пунктами меню. */
export function normalizeMenuPathname(pathname: string | undefined | null): string {
  let p = (pathname ?? '').trim()
  if (!p) return '/'
  if (!p.startsWith('/')) p = `/${p}`
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

/** Собирает внутренние href: у пунктов с подменю — только дочерние `href` (корень раздела — отдельный подпункт, если нужен в меню). */
export function collectMenuHrefs(items: SidebarNavEntry[]): string[] {
  const out: string[] = []
  for (const entry of items) {
    if (entry.type !== 'item') continue
    if (entry.children?.length) {
      for (const c of entry.children) {
        const h = c.href?.trim()
        if (!c.disabled && h) out.push(h)
      }
    } else {
      const h = entry.href?.trim()
      if (h && !entry.disabled) out.push(h)
    }
  }
  return out
}

/**
 * Самый специфичный href из меню, соответствующий текущему пути.
 * «Рабочий стол» (`/`) совпадает только с точным путём `/`, не с префиксами других маршрутов.
 */
export function getActiveHref(pathname: string | undefined | null, hrefs: string[]): string | null {
  const path = normalizeMenuPathname(pathname)
  const set = new Set(
    hrefs
      .map((h) => h.trim())
      .filter((h) => h.startsWith('/') && h.length > 0),
  )

  if (path === '/' && set.has('/')) return '/'

  const candidates = [...set]
    .filter((h) => h !== '/')
    .sort((a, b) => b.length - a.length)

  for (const h of candidates) {
    if (path === h || path.startsWith(`${h}/`)) return h
  }

  return null
}
