<script setup lang="ts">
import { ArrowUpRight03Icon } from '@hugeicons/core-free-icons'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { computed, onBeforeMount, ref, watch } from 'vue'
import type { IconArray } from '@hugeicons/vue'
import {
  isSidebarNavSubDivider,
  navMenuConfig,
  type SidebarNavEntry,
  type SidebarNavMenuItem,
  type SidebarNavSubItem,
} from './app-sidebar-nav.config'
import { collectMenuHrefs, getActiveHref } from './app-sidebar-nav-active'
import {
  productNavChevronClass,
  productNavLinkColorClass,
  productNavToggleRowClass,
  sidebarNavActiveStateClass,
  sidebarNavHorizontalPaddingClass,
  sidebarNavIdleHoverClass,
  sidebarNavLabelHoverClass,
  sidebarNavRowBaseClass,
  sidebarNavRowGroupClass,
  sidebarNavRowHeightClass,
  sidebarNavSubItemBaseClass,
} from './app-sidebar-nav-product-surface'
import ProductIcon from './ProductIcon.vue'
import {
  applySavedOpenSections,
  loadSidebarExpandedGroups,
  persistSidebarOpenSections,
} from '@lib/sidebar/sidebar-expanded-groups'
import { cn } from '@lib/utils'

const props = withDefaults(defineProps<{
  menuConfig?: SidebarNavEntry[]
}>(), {
  menuConfig: () => navMenuConfig,
})

const route = useRoute()
const hrefs = computed(() => collectMenuHrefs(props.menuConfig))
const activeHref = computed(() => getActiveHref(route.path, hrefs.value))

function defaultOpenSections(config: SidebarNavEntry[]): Record<string, boolean> {
  const state: Record<string, boolean> = {}
  for (const entry of config) {
    if (entry.type !== 'section') continue
    for (const item of entry.items) {
      if (!isExpandable(item)) continue
      if (item.defaultOpen) {
        state[item.key] = true
      }
    }
  }
  return state
}

const openSections = ref<Record<string, boolean>>(defaultOpenSections(props.menuConfig))
const isHydrated = ref(false)

const externalLinkArrowIcon = ArrowUpRight03Icon as IconArray

function menuItemHugeIcon(item: SidebarNavMenuItem): IconArray | undefined {
  const { icon } = item
  return icon != null && Array.isArray(icon) ? icon : undefined
}

function subItemHugeIcon(sub: SidebarNavSubItem): IconArray | undefined {
  const { icon } = sub
  return icon != null && Array.isArray(icon) ? icon : undefined
}

function isHrefActive(href: string | undefined): boolean {
  if (!href?.trim() || !activeHref.value) return false
  return href.trim() === activeHref.value
}

function isSubItemActive(sub: SidebarNavSubItem): boolean {
  return Boolean(sub.href && !sub.disabled && isHrefActive(sub.href))
}

function isMenuItemActive(item: SidebarNavMenuItem): boolean {
  return Boolean(item.href && !item.disabled && isHrefActive(item.href))
}

function isExpandableGroupActive(item: SidebarNavMenuItem): boolean {
  if (isMenuItemActive(item)) return true
  return Boolean(item.children?.some(sub => !isSidebarNavSubDivider(sub) && isSubItemActive(sub)))
}

function isExpandableToggleActive(item: SidebarNavMenuItem): boolean {
  return isExpandableGroupActive(item) && !openSections.value[item.key]
}

function navLinkColorClass(active: boolean): string {
  return active
    ? cn(sidebarNavActiveStateClass, 'font-medium text-foreground')
    : cn('font-medium text-foreground/80', sidebarNavIdleHoverClass)
}

function navLabelClass(active: boolean): string {
  return cn(
    'min-w-0 wrap-break-word font-medium',
    active ? 'text-foreground' : 'text-foreground/80',
  )
}

const navIconClass = cn('shrink-0 text-foreground/80')

const expandableToggleTextClass = 'text-foreground/80'

function expandableChevronClass(item: SidebarNavMenuItem): string {
  const chevronColorClass = item.productIcon
    ? productNavChevronClass(item.productIcon)
    : 'text-input'
  return cn('size-4 shrink-0', chevronColorClass)
}

/** Единый отступ субменю слева — 28px. */
function subMenuLinkPlClass(_item: SidebarNavMenuItem) {
  return 'pl-7'
}

function isExpandable(item: SidebarNavMenuItem): boolean {
  return Boolean(item.children?.length || item.expandable)
}

function externalMenuItemRowClass(item: SidebarNavMenuItem): string {
  if (item.productIcon) {
    return cn(
      sidebarNavRowGroupClass,
      sidebarNavRowHeightClass,
      sidebarNavRowBaseClass,
      'gap-1.5',
      productNavLinkColorClass(item.productIcon, { active: false, external: true }),
    )
  }

  return cn(navLinkRowClass, navLinkColorClass(false))
}

function externalMenuItemLabelClass(item: SidebarNavMenuItem): string {
  if (item.productIcon) {
    return cn(
      'min-w-0 whitespace-normal wrap-break-word text-left leading-tight',
      sidebarNavLabelHoverClass,
    )
  }

  return cn(
    'min-w-0 whitespace-normal wrap-break-word text-left leading-tight',
    navLabelClass(false),
  )
}

function externalLinkArrowClass(_item: SidebarNavMenuItem): string {
  return cn(
    'size-4 shrink-0 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-foreground',
  )
}

function toggleSection(key: string) {
  openSections.value = {
    ...openSections.value,
    [key]: key in openSections.value ? !openSections.value[key] : true,
  }
}

function ensureActiveSectionsOpen() {
  const next = { ...openSections.value }
  for (const entry of props.menuConfig) {
    if (entry.type !== 'section') continue
    for (const item of entry.items) {
      if (!isExpandable(item)) continue
      if (isExpandableGroupActive(item)) {
        next[item.key] = true
      }
    }
  }
  openSections.value = next
}

function hydrateOpenSectionsFromStorage() {
  const defaults = defaultOpenSections(props.menuConfig)
  const saved = loadSidebarExpandedGroups()
  openSections.value = applySavedOpenSections(defaults, saved, props.menuConfig)
  ensureActiveSectionsOpen()
}

ensureActiveSectionsOpen()

onBeforeMount(() => {
  if (!import.meta.client) return
  hydrateOpenSectionsFromStorage()
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

watch(activeHref, ensureActiveSectionsOpen)

function expandableToggleRowClass(item: SidebarNavMenuItem): string {
  const toggleActive = isExpandableToggleActive(item)

  if (item.productIcon) {
    return productNavToggleRowClass(item.productIcon, {
      active: toggleActive,
    })
  }

  return cn(
    sidebarNavRowGroupClass,
    sidebarNavRowHeightClass,
    sidebarNavRowBaseClass,
    'gap-1.5 font-medium',
    expandableToggleTextClass,
    toggleActive ? sidebarNavActiveStateClass : sidebarNavIdleHoverClass,
  )
}

const navLinkRowClass = cn(
  sidebarNavRowGroupClass,
  sidebarNavRowHeightClass,
  sidebarNavRowBaseClass,
  'justify-between font-medium',
)
</script>

<template>
  <div :class="cn('flex min-h-0 flex-1 flex-col py-4', sidebarNavHorizontalPaddingClass)">
    <nav class="flex flex-col space-y-4" aria-label="Основное меню">
      <template v-for="entry in menuConfig" :key="entry.key">
        <div
          v-if="entry.type === 'section'"
          class="flex flex-col space-y-1"
        >
          <p
            v-if="entry.title"
            class="px-2.5 text-xs font-normal text-text-placeholder"
          >
            {{ entry.title }}
          </p>
          <template v-for="item in entry.items" :key="item.key">
            <div v-if="isExpandable(item)">
              <button
                type="button"
                :class="expandableToggleRowClass(item)"
                :aria-expanded="Boolean(openSections[item.key])"
                :aria-label="`Подменю: ${item.title}`"
                @click="toggleSection(item.key)"
              >
                <ProductIcon
                  v-if="item.productIcon"
                  :icon="item.productIcon"
                  variant="default"
                  class="size-6"
                />
                <HugeIcon
                  v-else-if="menuItemHugeIcon(item)"
                  :icon="menuItemHugeIcon(item)!"
                  :size="20"
                  :class="cn('size-5 shrink-0', expandableToggleTextClass)"
                />
                <span
                  :class="cn(
                    'min-w-0 flex-1 whitespace-normal text-left leading-tight font-medium',
                    expandableToggleTextClass,
                  )"
                >
                  {{ item.title }}
                </span>
                <ChevronUp
                  v-if="openSections[item.key]"
                  :class="expandableChevronClass(item)"
                  aria-hidden="true"
                />
                <ChevronDown
                  v-else
                  :class="expandableChevronClass(item)"
                  aria-hidden="true"
                />
              </button>

              <div
                v-if="openSections[item.key] && item.children?.length"
                class="mt-1"
              >
                <div class="flex flex-col space-y-1">
                  <template
                    v-for="(sub, index) in item.children"
                    :key="isSidebarNavSubDivider(sub) ? sub.key : `${item.key}-sub-${index}`"
                  >
                    <div
                      v-if="isSidebarNavSubDivider(sub)"
                      :class="cn('py-1', subMenuLinkPlClass(item))"
                      role="separator"
                    >
                      <div class="h-px w-full bg-border" />
                    </div>
                    <NuxtLink
                      v-else-if="!sub.disabled && sub.href"
                      :to="sub.href"
                      :class="cn(
                        sidebarNavSubItemBaseClass,
                        'flex w-full min-w-0 shrink-0 items-center justify-between px-2.5',
                        subMenuLinkPlClass(item),
                        navLinkColorClass(isSubItemActive(sub)),
                      )"
                      :aria-current="isSubItemActive(sub) ? 'page' : undefined"
                    >
                      <span class="flex min-w-0 items-center gap-2 wrap-break-word">
                        <HugeIcon
                          v-if="subItemHugeIcon(sub)"
                          :icon="subItemHugeIcon(sub)!"
                          :size="20"
                          :class="navIconClass"
                        />
                        <component
                          :is="sub.icon"
                          v-else-if="sub.icon"
                          :class="cn('size-5 shrink-0', navIconClass)"
                          aria-hidden="true"
                        />
                        <span :class="navLabelClass(isSubItemActive(sub))">
                          {{ sub.title }}
                        </span>
                      </span>
                    </NuxtLink>
                  </template>
                </div>
              </div>
            </div>

            <a
              v-else-if="item.externalUrl && !item.disabled"
              :href="item.externalUrl"
              target="_blank"
              rel="noopener noreferrer"
              :class="externalMenuItemRowClass(item)"
            >
              <ProductIcon
                v-if="item.productIcon"
                :icon="item.productIcon"
                variant="default"
                class="size-6"
              />
              <HugeIcon
                v-else-if="menuItemHugeIcon(item)"
                :icon="menuItemHugeIcon(item)!"
                :size="20"
                :class="navIconClass"
              />
              <span
                :class="cn(
                  'min-w-0 flex-1 text-left',
                  externalMenuItemLabelClass(item),
                )"
              >
                {{ item.title }}
              </span>
              <HugeIcon
                :icon="externalLinkArrowIcon"
                :size="16"
                :class="externalLinkArrowClass(item)"
                aria-hidden="true"
              />
            </a>

            <NuxtLink
              v-else-if="item.href && !item.disabled"
              :to="item.href"
              :class="cn(
                navLinkRowClass,
                navLinkColorClass(isMenuItemActive(item)),
              )"
              :aria-current="isMenuItemActive(item) ? 'page' : undefined"
            >
              <span class="flex min-w-0 items-center gap-2">
                <HugeIcon
                  v-if="menuItemHugeIcon(item)"
                  :icon="menuItemHugeIcon(item)!"
                  :size="20"
                  :class="navIconClass"
                />
                <span
                  :class="cn(
                    'min-w-0 whitespace-normal wrap-break-word text-left leading-tight',
                    navLabelClass(isMenuItemActive(item)),
                  )"
                >
                  {{ item.title }}
                </span>
              </span>
            </NuxtLink>
          </template>
        </div>

        <a
          v-else-if="entry.type === 'item' && entry.externalUrl && !entry.disabled"
          :href="entry.externalUrl"
          target="_blank"
          rel="noopener noreferrer"
          :class="externalMenuItemRowClass(entry)"
        >
          <ProductIcon
            v-if="entry.productIcon"
            :icon="entry.productIcon"
            variant="default"
            class="size-6"
          />
          <HugeIcon
            v-else-if="menuItemHugeIcon(entry)"
            :icon="menuItemHugeIcon(entry)!"
            :size="20"
            :class="navIconClass"
          />
          <span
            :class="cn(
              'min-w-0 flex-1 text-left',
              externalMenuItemLabelClass(entry),
            )"
          >
            {{ entry.title }}
          </span>
          <HugeIcon
            :icon="externalLinkArrowIcon"
            :size="16"
            :class="externalLinkArrowClass(entry)"
            aria-hidden="true"
          />
        </a>

        <NuxtLink
          v-else-if="entry.type === 'item' && entry.href && !entry.disabled"
          :to="entry.href"
          :class="cn(
            navLinkRowClass,
            navLinkColorClass(isMenuItemActive(entry)),
          )"
          :aria-current="isMenuItemActive(entry) ? 'page' : undefined"
        >
          <span class="flex min-w-0 items-center gap-2">
            <HugeIcon
              v-if="menuItemHugeIcon(entry)"
              :icon="menuItemHugeIcon(entry)!"
              :size="20"
              :class="navIconClass"
            />
            <span
              :class="cn(
                'min-w-0 whitespace-normal wrap-break-word text-left leading-tight',
                navLabelClass(isMenuItemActive(entry)),
              )"
            >
              {{ entry.title }}
            </span>
          </span>
        </NuxtLink>
      </template>
    </nav>
  </div>
</template>
