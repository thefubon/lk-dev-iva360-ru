export const SIDEBAR_EXPANDED_GROUPS_STORAGE_KEY = 'iva360:sidebar-expanded-groups'

export type SidebarNavEntryForOpenSections = {
  type: 'item' | 'divider'
  key: string
  children?: unknown[]
  expandable?: boolean
}

function isExpandableMenuItem(item: SidebarNavEntryForOpenSections): boolean {
  return item.type === 'item' && Boolean(item.children?.length || item.expandable)
}

/** Stable `key` values from nav config (e.g. `admin-integrations`, `meetings`). */
export function collectExpandableMenuKeys(config: SidebarNavEntryForOpenSections[]): string[] {
  const keys: string[] = []
  for (const entry of config) {
    if (!isExpandableMenuItem(entry)) continue
    keys.push(entry.key)
  }
  return keys
}

export function loadSidebarExpandedGroups(): Record<string, boolean> {
  if (!import.meta.client) {
    return {}
  }

  try {
    const raw = localStorage.getItem(SIDEBAR_EXPANDED_GROUPS_STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    const result: Record<string, boolean> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'boolean') {
        result[key] = value
      }
    }
    return result
  } catch {
    return {}
  }
}

export function saveSidebarExpandedGroups(groups: Record<string, boolean>): void {
  if (!import.meta.client) return

  try {
    localStorage.setItem(SIDEBAR_EXPANDED_GROUPS_STORAGE_KEY, JSON.stringify(groups))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Applies persisted open/closed flags for keys present in the current menu config. */
export function applySavedOpenSections(
  base: Record<string, boolean>,
  saved: Record<string, boolean>,
  config: SidebarNavEntryForOpenSections[],
): Record<string, boolean> {
  const next = { ...base }
  for (const key of collectExpandableMenuKeys(config)) {
    const value = saved[key]
    if (typeof value === 'boolean') {
      next[key] = value
    }
  }
  return next
}

/** Merges current sidebar state into storage without dropping keys from the other mode. */
export function persistSidebarOpenSections(
  openSections: Record<string, boolean>,
  config: SidebarNavEntryForOpenSections[],
): void {
  const existing = loadSidebarExpandedGroups()
  const patch: Record<string, boolean> = {}

  for (const key of collectExpandableMenuKeys(config)) {
    const value = openSections[key]
    if (typeof value === 'boolean') {
      patch[key] = value
    }
  }

  saveSidebarExpandedGroups({ ...existing, ...patch })
}
