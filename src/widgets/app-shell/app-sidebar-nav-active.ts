import {
  isSidebarNavSubDivider,
  type SidebarNavEntry,
  type SidebarNavMenuItem,
} from './app-sidebar-nav.config'

/** Нормализует pathname из vue-router для сопоставления с пунктами меню. */
export function normalizeMenuPathname(pathname: string | undefined | null): string {
  let p = (pathname ?? '').trim()
  if (!p) return '/'
  if (!p.startsWith('/')) p = `/${p}`
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p
}

function collectItemHrefs(item: SidebarNavMenuItem): string[] {
  const out: string[] = []
  if (item.children?.length) {
    for (const c of item.children) {
      if (isSidebarNavSubDivider(c)) continue
      const h = c.href?.trim()
      if (!c.disabled && h) out.push(h)
    }
  } else {
    const h = item.href?.trim()
    if (h && !item.disabled) out.push(h)
  }
  return out
}

/** Собирает внутренние href: у пунктов с подменю — только дочерние `href` (корень раздела — отдельный подпункт, если нужен в меню). */
export function collectMenuHrefs(items: SidebarNavEntry[]): string[] {
  const out: string[] = []
  for (const entry of items) {
    if (entry.type === 'section') {
      for (const item of entry.items) {
        out.push(...collectItemHrefs(item))
      }
      continue
    }
    if (entry.type !== 'item') continue
    out.push(...collectItemHrefs(entry))
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
