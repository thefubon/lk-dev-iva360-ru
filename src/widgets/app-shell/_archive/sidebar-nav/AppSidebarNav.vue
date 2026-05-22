<script setup lang="ts">
import { ArrowUpRight, ChevronDown } from 'lucide-vue-next'
import { computed, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { collectMenuHrefs, getActiveHref } from '../../app-sidebar-nav-active'
import {
  isSidebarNavSubDivider,
  type SidebarNavEntry,
  type SidebarNavMenuItem,
  type SidebarNavSubEntry,
  type SidebarNavSubItem,
} from '../../app-sidebar-nav.config'
import { navMenuConfig } from './app-sidebar-nav.config'
import ProductIcon from '../../ProductIcon.vue'
import {
  productNavChevronClass,
  productNavLinkColorClass,
  productNavToggleRowClass,
  sidebarNavActiveBackgroundClass,
  sidebarNavIdleHoverClass,
  sidebarNavLabelHoverClass,
  sidebarNavLucideIconClass,
  sidebarNavToggleLucideIconClass,
  sidebarNavRowBaseClass,
  sidebarNavRowGroupClass,
  sidebarNavRowHeightClass,
  sidebarNavSubItemBaseClass,
} from '../../app-sidebar-nav-product-surface'
import {
  applySavedOpenSections,
  loadSidebarExpandedGroups,
  persistSidebarOpenSections,
} from '@lib/sidebar/sidebar-expanded-groups'
import { cn } from '@lib/utils'
import { SidebarSeparator, useSidebar } from '@/shared/ui/sidebar'

const props = withDefaults(defineProps<{
  menuConfig?: SidebarNavEntry[]
}>(), {
  menuConfig: () => navMenuConfig,
})

function isNavLinkItem(entry: SidebarNavEntry): entry is SidebarNavMenuItem {
  return entry.type === 'item'
}

function isExpandable(item: SidebarNavMenuItem): boolean {
  return Boolean(item.children?.length || item.expandable)
}

function defaultOpenSections(config: SidebarNavEntry[]): Record<string, boolean> {
  const state: Record<string, boolean> = {}
  for (const entry of config) {
    if (!isNavLinkItem(entry) || !isExpandable(entry)) continue
    state[entry.key] = Boolean(entry.defaultOpen)
  }
  return state
}

function mergeInitialOpenWithActive(
  base: Record<string, boolean>,
  active: string | null,
  config: SidebarNavEntry[],
): Record<string, boolean> {
  const next = { ...base }
  for (const entry of config) {
    if (!isNavLinkItem(entry) || !entry.children?.length) continue
    const childMatch = entry.children.some(
      c => !isSidebarNavSubDivider(c) && !c.disabled && Boolean(c.href) && c.href === active,
    )
    const parentMatch = Boolean(
      entry.href && !entry.disabled && entry.href === active,
    )
    if (childMatch || parentMatch) {
      next[entry.key] = true
    }
  }
  return next
}

function isExpandableGroupActive(
  item: SidebarNavMenuItem,
  activeHref: MaybeRefOrGetter<string | null>,
) {
  const active = toValue(activeHref)
  if (!active) return false
  if (item.href && !item.disabled && item.href === active) return true
  return Boolean(
    item.children?.some(
      c => !isSidebarNavSubDivider(c) && !c.disabled && Boolean(c.href) && c.href === active,
    ),
  )
}

function navRowIsActive(item: SidebarNavMenuItem, active: string | null) {
  const groupActive = isExpandableGroupActive(item, active)
  const rowActive = Boolean(
    item.href && !item.disabled && item.href === active,
  )
  return groupActive || rowActive
}

function rowColorClass(item: SidebarNavMenuItem, active: string | null) {
  return navRowIsActive(item, active)
    ? cn('font-medium text-foreground', sidebarNavActiveBackgroundClass)
    : cn('font-medium text-foreground/80', sidebarNavIdleHoverClass)
}

function navLabelClass(_item: SidebarNavMenuItem, _active: string | null) {
  return cn(
    'min-w-0 flex-1 whitespace-normal wrap-break-word text-left leading-tight',
    sidebarNavLabelHoverClass,
  )
}

function navLucideIconClass(_item: SidebarNavMenuItem, _active: string | null) {
  return sidebarNavLucideIconClass
}

function expandableChevronClass(
  item: SidebarNavMenuItem,
  activeHref: MaybeRefOrGetter<string | null>,
) {
  const active = navRowIsActive(item, toValue(activeHref))
  if (item.productIcon) {
    return cn(
      'size-4 shrink-0',
      productNavChevronClass(item.productIcon),
    )
  }
  return cn(
    'size-4 shrink-0 text-secondary/50',
  )
}

function navLinkColorClass(item: SidebarNavMenuItem, activeHref: MaybeRefOrGetter<string | null>) {
  const active = toValue(activeHref)
  if (item.productIcon) {
    const groupActive = isExpandableGroupActive(item, active)
    const rowActive = Boolean(
      item.href && !item.disabled && item.href === active,
    )
    return productNavLinkColorClass(item.productIcon, {
      active: groupActive || rowActive,
      external: Boolean(item.externalUrl && !item.href),
    })
  }
  return rowColorClass(item, active)
}

function navLinkRowClass(item: SidebarNavMenuItem, activeHref: MaybeRefOrGetter<string | null>) {
  return cn(
    sidebarNavRowGroupClass,
    sidebarNavRowHeightClass,
    sidebarNavRowBaseClass,
    navLinkColorClass(item, activeHref),
  )
}

function navToggleRowClass(item: SidebarNavMenuItem, activeHref: MaybeRefOrGetter<string | null>) {
  const groupActive = isExpandableGroupActive(item, activeHref)
  const toggleActive = groupActive && !openSections.value[item.key]
  if (item.productIcon) {
    return cn(
      sidebarNavRowHeightClass,
      productNavToggleRowClass(item.productIcon, { active: toggleActive }),
    )
  }
  return cn(
    sidebarNavRowGroupClass,
    sidebarNavRowHeightClass,
    sidebarNavRowBaseClass,
    'font-medium text-foreground/80',
    toggleActive ? sidebarNavActiveBackgroundClass : sidebarNavIdleHoverClass,
  )
}

function subItemIsActive(sub: SidebarNavSubItem, activeHref: MaybeRefOrGetter<string | null>) {
  const active = toValue(activeHref)
  return Boolean(
    sub.href && !sub.disabled && sub.href === active,
  )
}

function isAnySubItemActive(
  item: SidebarNavMenuItem,
  activeHref: MaybeRefOrGetter<string | null>,
) {
  return Boolean(
    item.children?.some(sub => !isSidebarNavSubDivider(sub) && subItemIsActive(sub, activeHref)),
  )
}

function subItemPaddingClass(entry: SidebarNavMenuItem) {
  return entry.productIcon ? 'pl-2.5' : 'pl-[18px]'
}

const route = useRoute()
const { isMobile, setOpenMobile } = useSidebar()

const hrefs = computed(() => collectMenuHrefs(props.menuConfig))
const activeHref = computed(() => getActiveHref(route.path, hrefs.value))

function navEntryAriaCurrent(entry: SidebarNavMenuItem): 'page' | undefined {
  if (!entry.href || entry.disabled) return undefined
  return entry.href === activeHref.value ? 'page' : undefined
}

const openSections = ref<Record<string, boolean>>({})
const isHydrated = ref(false)

function closeMobileSidebar() {
  if (isMobile.value) setOpenMobile(false)
}

function getFirstNavigableSubItem(
  children: SidebarNavSubEntry[] | undefined,
): SidebarNavSubItem | undefined {
  return children?.find(
    (sub): sub is SidebarNavSubItem =>
      !isSidebarNavSubDivider(sub) && !sub.disabled && Boolean(sub.href || sub.externalUrl),
  )
}

async function navigateToSubItem(sub: SidebarNavSubItem) {
  closeMobileSidebar()
  if (sub.href) {
    await navigateTo(sub.href)
  } else if (sub.externalUrl) {
    window.open(sub.externalUrl, '_blank', 'noopener,noreferrer')
  }
}

function toggleSection(key: string) {
  openSections.value = {
    ...openSections.value,
    [key]: !openSections.value[key],
  }
}

function handleExpandableItemClick(item: SidebarNavMenuItem) {
  const isExpanded = Boolean(openSections.value[item.key])
  const hasActiveSub = isAnySubItemActive(item, activeHref.value)

  if (isExpanded && hasActiveSub) {
    toggleSection(item.key)
    return
  }

  if (!isExpanded) {
    toggleSection(item.key)
    if (hasActiveSub) {
      return
    }
  }

  const firstSub = getFirstNavigableSubItem(item.children)
  if (firstSub) {
    void navigateToSubItem(firstSub)
  }
}

onMounted(() => {
  const defaults = defaultOpenSections(props.menuConfig)
  const saved = loadSidebarExpandedGroups()
  const withSaved = applySavedOpenSections(defaults, saved, props.menuConfig)
  openSections.value = mergeInitialOpenWithActive(
    withSaved,
    activeHref.value,
    props.menuConfig,
  )
  isHydrated.value = true
})

watch(
  openSections,
  (sections) => {
    if (!isHydrated.value) return
    persistSidebarOpenSections(sections, props.menuConfig)
  },
  { deep: true },
)

watch(activeHref, (href) => {
  if (!isHydrated.value) return
  for (const entry of props.menuConfig) {
    if (!isNavLinkItem(entry) || !entry.children?.length) continue
    const childMatch = entry.children.some(
      c => !isSidebarNavSubDivider(c) && !c.disabled && Boolean(c.href) && c.href === href,
    )
    const parentMatch = Boolean(entry.href && !entry.disabled && entry.href === href)
    if (childMatch || parentMatch) {
      openSections.value = { ...openSections.value, [entry.key]: true }
    }
  }
})
</script>

<template>
  <div
    :class="cn(
      'flex min-h-0 flex-1 flex-col gap-2 p-3',
      !isHydrated && 'pointer-events-none opacity-0',
    )"
  >
    <nav class="flex flex-col gap-1.5" aria-label="Основное меню">
      <template v-for="entry in menuConfig" :key="entry.key">
        <div
          v-if="entry.type === 'divider'"
          class="flex w-full shrink-0 flex-col py-2"
        >
          <SidebarSeparator class="bg-border mx-0 h-px w-full shrink-0" />
        </div>

        <template v-else-if="entry.type === 'item'">
          <!-- Раскрывающийся пункт: корень раздела — ссылка, шеврон — только раскрытие -->
          <div v-if="isExpandable(entry)">
            <div
              v-if="entry.href && !entry.disabled && entry.children?.length"
              :class="cn(
                'flex w-full min-w-0 shrink-0 items-center gap-1 rounded-sm px-2.5',
                sidebarNavRowHeightClass,
                sidebarNavRowGroupClass,
              )"
            >
              <NuxtLink
                v-if="!isAnySubItemActive(entry, activeHref)"
                :to="entry.href"
                :class="cn(
                  'flex h-full min-w-0 flex-1 items-center gap-2 rounded-sm text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  navLinkColorClass(entry, activeHref),
                )"
                :aria-current="entry.href === activeHref ? 'page' : undefined"
                @click="closeMobileSidebar"
              >
                <ProductIcon
                  v-if="entry.productIcon"
                  :icon="entry.productIcon"
                />
                <component
                  :is="entry.icon"
                  v-else-if="entry.icon"
                  :class="navLucideIconClass(entry, activeHref)"
                />
                <span :class="navLabelClass(entry, activeHref)">{{ entry.title }}</span>
              </NuxtLink>
              <span
                v-else
                :class="cn(
                  'flex h-full min-w-0 flex-1 items-center gap-2 rounded-sm text-left text-sm font-medium',
                  navLinkColorClass(entry, activeHref),
                )"
              >
                <ProductIcon
                  v-if="entry.productIcon"
                  :icon="entry.productIcon"
                />
                <component
                  :is="entry.icon"
                  v-else-if="entry.icon"
                  :class="navLucideIconClass(entry, activeHref)"
                />
                <span :class="navLabelClass(entry, activeHref)">{{ entry.title }}</span>
              </span>
              <button
                type="button"
                class="-mr-0.5 shrink-0 rounded-sm p-1 transition-colors"
                :aria-expanded="Boolean(openSections[entry.key])"
                :aria-label="`Подменю: ${entry.title}`"
                @click.stop="handleExpandableItemClick(entry)"
              >
                <ChevronDown
                  :class="cn(
                    expandableChevronClass(entry, activeHref),
                    openSections[entry.key] && 'rotate-180',
                  )"
                />
              </button>
            </div>
            <button
              v-else
              type="button"
              :class="navToggleRowClass(entry, activeHref)"
              :aria-expanded="Boolean(openSections[entry.key])"
              @click="handleExpandableItemClick(entry)"
            >
              <ProductIcon
                v-if="entry.productIcon"
                :icon="entry.productIcon"
              />
              <component
                :is="entry.icon"
                v-else-if="entry.icon"
                :class="sidebarNavToggleLucideIconClass"
              />
              <span :class="navLabelClass(entry, activeHref)">{{ entry.title }}</span>
              <ChevronDown
                :class="cn(
                  expandableChevronClass(entry, activeHref),
                  openSections[entry.key] && 'rotate-180',
                )"
              />
            </button>

            <div
              v-if="openSections[entry.key] && entry.children?.length"
              class="relative mt-1"
            >
              <!-- Сетка как у кнопки: px-2.5 + (size-8 | size-5) + gap-2; линия и полоска — по центру иконки -->
              <div
                :class="cn(
                  'pointer-events-none absolute inset-y-0.5 w-px -translate-x-1/2 rounded-none bg-border',
                  entry.productIcon
                    ? 'left-[calc(0.625rem+1rem+1px)]'
                    : 'left-[calc(0.625rem+0.625rem+1px)]',
                )"
                aria-hidden="true"
              />
              <div
                :class="cn(
                  'flex flex-col space-y-1 pr-2.5',
                  entry.productIcon
                    ? 'pl-[calc(0.625rem+2rem+0.5rem-0.625rem)]'
                    : 'pl-[calc(0.625rem+1.25rem+0.5rem-0.625rem)]',
                )"
              >
                <template
                  v-for="(sub, index) in entry.children"
                  :key="isSidebarNavSubDivider(sub) ? sub.key : `${entry.key}-${sub.title}-${index}`"
                >
                  <template v-if="!isSidebarNavSubDivider(sub)">
                  <NuxtLink
                    v-if="!sub.disabled && sub.href"
                    :to="sub.href"
                    :class="cn(
                      sidebarNavSubItemBaseClass,
                      sidebarNavRowGroupClass,
                      subItemIsActive(sub, activeHref)
                        ? cn('font-medium text-foreground', sidebarNavActiveBackgroundClass)
                        : cn('font-medium text-foreground/80', sidebarNavIdleHoverClass),
                    )"
                    :aria-current="subItemIsActive(sub, activeHref) ? 'page' : undefined"
                    @click="closeMobileSidebar"
                  >
                    <span
                      :class="cn(
                        'flex min-w-0 items-center gap-2 wrap-break-word',
                        subItemPaddingClass(entry),
                      )"
                    >
                      <component
                        :is="sub.icon"
                        v-if="sub.icon"
                        :class="cn(
                          'size-4 shrink-0 text-foreground/80',
                        )"
                        aria-hidden="true"
                      />
                      <span
                        :class="cn(
                          'min-w-0 wrap-break-word',
                          sidebarNavLabelHoverClass,
                        )"
                      >{{ sub.title }}</span>
                    </span>
                  </NuxtLink>
                  <a
                    v-else-if="!sub.disabled && sub.externalUrl && !sub.href"
                    :href="sub.externalUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    :class="cn(
                      sidebarNavSubItemBaseClass,
                      sidebarNavRowGroupClass,
                      'text-foreground/80',
                      sidebarNavIdleHoverClass,
                    )"
                    @click="closeMobileSidebar"
                  >
                    <span
                      :class="cn(
                        'flex min-w-0 items-center gap-2 wrap-break-word',
                        subItemPaddingClass(entry),
                      )"
                    >
                      <component
                        :is="sub.icon"
                        v-if="sub.icon"
                        class="size-4 shrink-0 text-foreground/80"
                        aria-hidden="true"
                      />
                      <span :class="cn('min-w-0 wrap-break-word', sidebarNavLabelHoverClass)">{{ sub.title }}</span>
                    </span>
                  </a>
                  <span
                    v-else
                    :class="cn(sidebarNavSubItemBaseClass, 'cursor-not-allowed text-muted-foreground opacity-60')"
                  >
                    <span
                      :class="cn(
                        'flex min-w-0 items-center gap-2 wrap-break-word',
                        subItemPaddingClass(entry),
                      )"
                    >
                      <component
                        :is="sub.icon"
                        v-if="sub.icon"
                        class="size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span class="min-w-0 wrap-break-word">{{ sub.title }}</span>
                    </span>
                  </span>
                  </template>
                </template>
              </div>
            </div>
          </div>

          <!-- Внешняя ссылка -->
          <a
            v-else-if="entry.externalUrl && !entry.disabled"
            :href="entry.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
            :class="navLinkRowClass(entry, activeHref)"
            @click="closeMobileSidebar"
          >
            <ProductIcon
              v-if="entry.productIcon"
              :icon="entry.productIcon"
            />
            <component
              :is="entry.icon"
              v-else-if="entry.icon"
              :class="navLucideIconClass(entry, activeHref)"
            />
            <span class="flex min-w-0 flex-1 items-center gap-1.5 text-left">
              <span :class="navLabelClass(entry, activeHref)">{{ entry.title }}</span>
              <ArrowUpRight
                :class="cn(
                  'size-4 shrink-0',
                  entry.productIcon
                    ? productNavChevronClass(entry.productIcon)
                    : cn(
                        'text-foreground/80 group-hover:text-foreground',
                        navRowIsActive(entry, activeHref) && 'text-foreground',
                      ),
                )"
                aria-hidden="true"
              />
            </span>
          </a>

          <!-- Внутренний маршрут -->
          <NuxtLink
            v-else-if="entry.href && !entry.disabled"
            :to="entry.href"
            :class="navLinkRowClass(entry, activeHref)"
            :aria-current="navEntryAriaCurrent(entry)"
            @click="closeMobileSidebar"
          >
            <ProductIcon
              v-if="entry.productIcon"
              :icon="entry.productIcon"
            />
            <component
              :is="entry.icon"
              v-else-if="entry.icon"
              :class="navLucideIconClass(entry, activeHref)"
            />
            <span :class="navLabelClass(entry, activeHref)">{{ entry.title }}</span>
          </NuxtLink>

          <!-- Неактивная строка -->
          <span
            v-else
            :class="cn(sidebarNavRowHeightClass, sidebarNavRowBaseClass, 'cursor-not-allowed text-foreground/80 opacity-60')"
            :title="entry.tooltip"
          >
            <ProductIcon
              v-if="entry.productIcon"
              :icon="entry.productIcon"
              class="opacity-90"
            />
            <component
              :is="entry.icon"
              v-else-if="entry.icon"
              class="size-5 shrink-0"
            />
            <span class="min-w-0 flex-1 whitespace-normal wrap-break-word leading-tight">{{ entry.title }}</span>
          </span>
        </template>
      </template>
    </nav>
  </div>
</template>
