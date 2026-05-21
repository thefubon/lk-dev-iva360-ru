<script setup lang="ts">
import { ArrowUpRight, ChevronDown } from 'lucide-vue-next'
import { computed, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { collectMenuHrefs, getActiveHref } from './app-sidebar-nav-active'
import {
  navMenuConfig,
  type SidebarNavEntry,
  type SidebarNavMenuItem,
  type SidebarNavSubItem,
} from './app-sidebar-nav.config'
import { productIconUrls } from './app-sidebar-nav-product-icons'
import {
  productNavChevronClass,
  productNavRowClass,
  productNavSubLinkClass,
  productNavSubLinkIndicatorClass,
  productNavSubTreeGuideClass,
  sidebarNavRowBaseClass,
} from './app-sidebar-nav-product-surface'
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
      c => !c.disabled && Boolean(c.href) && c.href === active,
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
      c => !c.disabled && Boolean(c.href) && c.href === active,
    ),
  )
}

function rowClass(item: SidebarNavMenuItem, active: string | null) {
  const groupActive = isExpandableGroupActive(item, active)
  const rowActive = Boolean(
    item.href && !item.disabled && item.href === active,
  )
  return cn(
    sidebarNavRowBaseClass,
    groupActive || rowActive
      ? 'bg-muted/75 font-medium text-foreground'
      : 'text-foreground/80 hover:bg-muted/75 hover:text-foreground-hover',
  )
}

function navRowClass(item: SidebarNavMenuItem, activeHref: MaybeRefOrGetter<string | null>) {
  const active = toValue(activeHref)
  if (item.productIcon) {
    const groupActive = isExpandableGroupActive(item, active)
    const rowActive = Boolean(
      item.href && !item.disabled && item.href === active,
    )
    return productNavRowClass(item.productIcon, {
      active: groupActive || rowActive,
    })
  }
  return rowClass(item, active)
}

function subItemIsActive(sub: SidebarNavSubItem, activeHref: MaybeRefOrGetter<string | null>) {
  const active = toValue(activeHref)
  return Boolean(
    sub.href && !sub.disabled && sub.href === active,
  )
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
const animReady = ref(false)

function closeMobileSidebar() {
  if (isMobile.value) setOpenMobile(false)
}

function toggleSection(key: string) {
  openSections.value = {
    ...openSections.value,
    [key]: !openSections.value[key],
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
  requestAnimationFrame(() => {
    animReady.value = true
  })
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
      c => !c.disabled && Boolean(c.href) && c.href === href,
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

        <template v-else>
          <!-- Раскрывающийся пункт: корень раздела — ссылка, шеврон — только раскрытие -->
          <div v-if="isExpandable(entry)">
            <div
              v-if="entry.href && !entry.disabled && entry.children?.length"
              :class="cn(entry.productIcon && 'group', navRowClass(entry, activeHref), 'gap-1')"
            >
              <NuxtLink
                :to="entry.href"
                class="flex min-w-0 flex-1 items-center gap-2 rounded-sm py-0.5 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                :aria-current="entry.href === activeHref ? 'page' : undefined"
                @click="closeMobileSidebar"
              >
                <span class="flex size-7 shrink-0 items-center justify-center">
                  <img
                    v-if="entry.productIcon"
                    :src="productIconUrls[entry.productIcon]"
                    alt=""
                    draggable="false"
                    class="size-7 object-contain select-none"
                    aria-hidden="true"
                  >
                  <component
                    :is="entry.icon"
                    v-else-if="entry.icon"
                    class="size-5 shrink-0"
                  />
                </span>
                <span class="min-w-0 flex-1 whitespace-normal wrap-break-word text-left leading-tight">{{ entry.title }}</span>
              </NuxtLink>
              <button
                type="button"
                class="text-secondary/50 hover:text-foreground -mr-0.5 shrink-0 rounded-sm p-1 transition-colors"
                :aria-expanded="Boolean(openSections[entry.key])"
                :aria-label="`Подменю: ${entry.title}`"
                @click.stop="toggleSection(entry.key)"
              >
                <ChevronDown
                  :class="cn(
                    'size-4 shrink-0 transition-colors duration-200',
                    animReady && 'transition-transform duration-200',
                    openSections[entry.key] && 'rotate-180',
                    entry.productIcon
                      ? productNavChevronClass(
                          entry.productIcon,
                          isExpandableGroupActive(entry, activeHref),
                        )
                      : 'text-secondary/50',
                  )"
                />
              </button>
            </div>
            <button
              v-else
              type="button"
              :class="cn(entry.productIcon && 'group', navRowClass(entry, activeHref))"
              :aria-expanded="Boolean(openSections[entry.key])"
              @click="toggleSection(entry.key)"
            >
              <span class="flex size-7 shrink-0 items-center justify-center">
                <img
                  v-if="entry.productIcon"
                  :src="productIconUrls[entry.productIcon]"
                  alt=""
                  draggable="false"
                  class="size-7 object-contain select-none"
                  aria-hidden="true"
                >
                <component
                  :is="entry.icon"
                  v-else-if="entry.icon"
                  class="size-5 shrink-0"
                />
              </span>
              <span class="min-w-0 flex-1 whitespace-normal wrap-break-word text-left leading-tight">{{ entry.title }}</span>
              <ChevronDown
                :class="cn(
                  'size-4 shrink-0 transition-colors duration-200',
                  animReady && 'transition-transform duration-200',
                  openSections[entry.key] && 'rotate-180',
                  entry.productIcon
                    ? productNavChevronClass(
                        entry.productIcon,
                        isExpandableGroupActive(entry, activeHref),
                      )
                    : 'text-secondary/50',
                )"
              />
            </button>

            <div
              v-if="openSections[entry.key] && entry.children?.length"
              class="relative mt-1"
            >
              <!-- Сетка как у кнопки: px-2.5 + (size-7 | size-5) + gap-2; линия — по центру иконки -->
              <div
                :class="cn(
                  'pointer-events-none absolute inset-y-0.5 w-px -translate-x-1/2 rounded-none',
                  entry.productIcon
                    ? productNavSubTreeGuideClass(entry.productIcon)
                    : 'bg-border',
                  entry.productIcon
                    ? 'left-[calc(0.625rem+0.875rem+1px)]'
                    : 'left-[calc(0.625rem+0.625rem+1px)]',
                )"
                aria-hidden="true"
              />
              <div
                :class="cn(
                  'flex flex-col space-y-1 pr-2.5',
                  entry.productIcon
                    ? 'pl-[calc(0.625rem+1.75rem+0.5rem-0.625rem)]'
                    : 'pl-[calc(0.625rem+1.25rem+0.5rem-0.625rem)]',
                )"
              >
                <template v-for="sub in entry.children" :key="`${entry.key}-${sub.title}`">
                  <NuxtLink
                    v-if="!sub.disabled && sub.href"
                    :to="sub.href"
                    class="relative block rounded-sm py-1.5 text-sm wrap-break-word whitespace-normal leading-tight transition-colors"
                    :class="
                      entry.productIcon
                        ? productNavSubLinkClass(entry.productIcon, {
                            active: subItemIsActive(sub, activeHref),
                          })
                        : subItemIsActive(sub, activeHref)
                          ? 'font-medium text-primary'
                          : 'text-foreground hover:text-primary'
                    "
                    :aria-current="subItemIsActive(sub, activeHref) ? 'page' : undefined"
                    @click="closeMobileSidebar"
                  >
                    <span
                      v-if="subItemIsActive(sub, activeHref)"
                      :class="cn(
                        'pointer-events-none absolute inset-y-0 w-0.5 shrink-0 -translate-x-1/2',
                        entry.productIcon
                          ? productNavSubLinkIndicatorClass(entry.productIcon)
                          : 'bg-primary',
                        entry.productIcon
                          ? 'left-[calc(1.5rem-(0.625rem+1.75rem+0.5rem-0.625rem)+1px)]'
                          : 'left-[calc(1.25rem-(0.625rem+1.25rem+0.5rem-0.625rem)+1px)]',
                      )"
                      aria-hidden="true"
                    />
                    <span
                      :class="cn(
                        'block min-w-0 wrap-break-word',
                        entry.productIcon ? 'pl-2.5' : 'pl-[18px]',
                      )"
                    >{{ sub.title }}</span>
                  </NuxtLink>
                  <a
                    v-else-if="!sub.disabled && sub.externalUrl && !sub.href"
                    :href="sub.externalUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="relative block rounded-sm py-1.5 text-sm wrap-break-word whitespace-normal leading-tight transition-colors text-foreground/80 hover:text-foreground-hover"
                    @click="closeMobileSidebar"
                  >
                    <span
                      :class="cn(
                        'block min-w-0 wrap-break-word',
                        entry.productIcon ? 'pl-2.5' : 'pl-[18px]',
                      )"
                    >{{ sub.title }}</span>
                  </a>
                  <span
                    v-else
                    class="text-muted-foreground cursor-not-allowed rounded-sm py-1.5 text-sm wrap-break-word whitespace-normal leading-tight opacity-60"
                  >
                    <span
                      :class="cn(
                        'block min-w-0 wrap-break-word',
                        entry.productIcon ? 'pl-2.5' : 'pl-[18px]',
                      )"
                    >{{ sub.title }}</span>
                  </span>
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
            :class="cn('group', navRowClass(entry, activeHref))"
            @click="closeMobileSidebar"
          >
            <span class="flex size-7 shrink-0 items-center justify-center">
              <img
                v-if="entry.productIcon"
                :src="productIconUrls[entry.productIcon]"
                alt=""
                draggable="false"
                class="size-7 object-contain select-none"
                aria-hidden="true"
              >
              <component
                :is="entry.icon"
                v-else-if="entry.icon"
                class="size-5 shrink-0"
              />
            </span>
            <span class="flex min-w-0 flex-1 items-center gap-1.5 text-left">
              <span class="whitespace-normal wrap-break-word leading-tight">{{ entry.title }}</span>
              <ArrowUpRight
                :class="cn(
                  'size-4 shrink-0 transition-colors duration-200',
                  entry.productIcon
                    ? productNavChevronClass(
                        entry.productIcon,
                        isExpandableGroupActive(entry, activeHref),
                      )
                    : 'text-secondary/50 group-hover:text-primary',
                )"
                aria-hidden="true"
              />
            </span>
          </a>

          <!-- Внутренний маршрут -->
          <NuxtLink
            v-else-if="entry.href && !entry.disabled"
            :to="entry.href"
            :class="navRowClass(entry, activeHref)"
            :aria-current="navEntryAriaCurrent(entry)"
            @click="closeMobileSidebar"
          >
            <span class="flex size-7 shrink-0 items-center justify-center">
              <img
                v-if="entry.productIcon"
                :src="productIconUrls[entry.productIcon]"
                alt=""
                draggable="false"
                class="size-7 object-contain select-none"
                aria-hidden="true"
              >
              <component
                :is="entry.icon"
                v-else-if="entry.icon"
                class="size-5 shrink-0"
              />
            </span>
            <span class="min-w-0 flex-1 whitespace-normal wrap-break-word text-left leading-tight">{{ entry.title }}</span>
          </NuxtLink>

          <!-- Неактивная строка -->
          <span
            v-else
            :class="cn(sidebarNavRowBaseClass, 'cursor-not-allowed text-foreground/80 opacity-60')"
            :title="entry.tooltip"
          >
            <span class="flex size-7 shrink-0 items-center justify-center">
              <img
                v-if="entry.productIcon"
                :src="productIconUrls[entry.productIcon]"
                alt=""
                draggable="false"
                class="size-7 object-contain select-none opacity-90"
                aria-hidden="true"
              >
              <component
                :is="entry.icon"
                v-else-if="entry.icon"
                class="size-5 shrink-0"
              />
            </span>
            <span class="min-w-0 flex-1 whitespace-normal wrap-break-word leading-tight">{{ entry.title }}</span>
          </span>
        </template>
      </template>
    </nav>
  </div>
</template>
