import type { ProductIconKey } from './app-sidebar-nav-product-icons'
import { cn } from '@lib/utils'

/** Фиксированная высота строки навигации — 36px (без py-*). */
export const sidebarNavRowHeightClass = 'h-9 min-h-9 max-h-9'

/** Строка навигации: иконка продукта size-8 по центру. */
export const sidebarNavRowBaseClass =
  'flex h-9 min-h-9 max-h-9 w-full min-w-0 shrink-0 cursor-pointer items-center gap-2 rounded-sm px-2.5 text-left text-sm font-medium transition-colors duration-300'

/** Подпункт подменю: единый размер и начертание для всех состояний. */
export const sidebarNavSubItemBaseClass =
  'relative flex h-9 min-h-9 max-h-9 cursor-pointer items-center rounded-sm text-sm font-medium wrap-break-word whitespace-normal leading-tight transition-colors duration-300'

/** Контейнер строки: group-hover для текста и иконок в дочерних элементах. */
export const sidebarNavRowGroupClass = 'group'

/** Подпись внешней ссылки продукта — без primary при hover (ProductIcon без изменений). */
export const sidebarNavLabelHoverClass = 'text-foreground/80'

/** Lucide в строке-ссылке — без primary при hover (не ProductIcon, не toggle). */
export const sidebarNavLucideIconClass = 'size-5 shrink-0'

/** Lucide в строке-переключателе — без primary/hover. */
export const sidebarNavToggleLucideIconClass = 'size-5 shrink-0 text-foreground/80'

/** Подпись переключателя подменю — без primary при hover. */
export const sidebarNavToggleLabelClass =
  'min-w-0 wrap-break-word font-medium text-foreground/80'

const baseRow = sidebarNavRowBaseClass

const productNavIdleTextClass = 'font-medium text-foreground/80'

/** Фон активной строки навигации (только `<a>` / NuxtLink). */
export const sidebarNavActiveBackgroundClass = 'bg-muted'

/** Hover для неактивных строк навигации (ссылки и переключатели подменю). */
export const sidebarNavIdleHoverClass = 'hover:bg-muted'

const productNavActiveClass = cn(
  'font-medium text-foreground',
  sidebarNavActiveBackgroundClass,
)

type ProductSurfaceEntry = {
  active: string
}

/** Активная строка продукта — тот же текст, что у idle; фон muted. */
const productSurface: Record<ProductIconKey, ProductSurfaceEntry> = {
  meetings: { active: productNavActiveClass },
  messenger: { active: productNavActiveClass },
  drive: { active: productNavActiveClass },
  mail: { active: productNavActiveClass },
  boards: { active: productNavActiveClass },
  calendar: { active: productNavActiveClass },
  'online-broadcasts': { active: productNavActiveClass },
  rooms: { active: productNavActiveClass },
  webinars: { active: productNavActiveClass },
  'ai-assistent': { active: productNavActiveClass },
}

export function productNavRowClass(
  key: ProductIconKey,
  opts: { active: boolean; external?: boolean },
): string {
  return cn(baseRow, productNavLinkColorClass(key, opts))
}

/** Только цвет/hover/active для ссылки продукта (без базовой строки). */
export function productNavLinkColorClass(
  key: ProductIconKey,
  opts: { active: boolean; external?: boolean },
): string {
  const s = productSurface[key]
  if (opts.active) return s.active
  return cn(productNavIdleTextClass, sidebarNavIdleHoverClass)
}

/** Строка-переключатель подменю: bg-muted только когда свёрнуто и активен дочерний пункт. */
export function productNavToggleRowClass(
  _key: ProductIconKey,
  opts?: { active?: boolean },
): string {
  return cn(
    baseRow,
    'gap-1.5',
    sidebarNavRowGroupClass,
    productNavIdleTextClass,
    opts?.active ? sidebarNavActiveBackgroundClass : sidebarNavIdleHoverClass,
  )
}

/** Шеврон раскрывающегося пункта — всегда нейтральный, без primary при active/hover. */
export function productNavChevronClass(_key: ProductIconKey): string {
  return 'text-input'
}
