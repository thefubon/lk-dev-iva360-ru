import type { ProductIconKey } from './app-sidebar-nav-product-icons'
import { cn } from '@lib/utils'

/** Одна строка + иконка 28px ≈ 36px высоты (py-1 + size-7). */
export const sidebarNavRowBaseClass =
  'flex w-full min-w-0 shrink-0 items-center gap-2 rounded-sm px-2.5 py-1 text-left text-sm font-medium transition-colors'

const baseRow = sidebarNavRowBaseClass

/** Hover и активная строка продукта — один фон `*-secondary`, текст `*-primary`. */
const productSurface: Record<
  ProductIconKey,
  { active: string; hover: string }
> = {
  meetings: {
    active: 'bg-meetings-secondary font-medium text-meetings-primary',
    hover:
      'text-foreground/80 hover:bg-meetings-secondary hover:text-meetings-primary',
  },
  messenger: {
    active: 'bg-messenger-secondary font-medium text-messenger-primary',
    hover:
      'text-foreground/80 hover:bg-messenger-secondary hover:text-messenger-primary',
  },
  drive: {
    active: 'bg-drive-secondary font-medium text-drive-primary',
    hover: 'text-foreground/80 hover:bg-drive-secondary hover:text-drive-primary',
  },
  mail: {
    active: 'bg-mail-secondary font-medium text-mail-primary',
    hover: 'text-foreground/80 hover:bg-mail-secondary hover:text-mail-primary',
  },
  boards: {
    active: 'bg-board-secondary font-medium text-board-primary',
    hover: 'text-foreground/80 hover:bg-board-secondary hover:text-board-primary',
  },
  calendar: {
    active: 'bg-mail-secondary font-medium text-mail-primary',
    hover: 'text-foreground/80 hover:bg-mail-secondary hover:text-mail-primary',
  },
  'online-broadcasts': {
    active: 'bg-broadcasts-secondary font-medium text-broadcasts-primary',
    hover:
      'text-foreground/80 hover:bg-broadcasts-secondary hover:text-broadcasts-primary',
  },
  rooms: {
    active: 'bg-rooms-secondary font-medium text-rooms-primary',
    hover: 'text-foreground/80 hover:bg-rooms-secondary hover:text-rooms-primary',
  },
  webinars: {
    active: 'bg-webinars-secondary font-medium text-webinars-primary',
    hover:
      'text-foreground/80 hover:bg-webinars-secondary hover:text-webinars-primary',
  },
  'ai-assistent': {
    active: 'bg-ai-secondary font-medium text-ai-primary',
    hover: 'text-foreground/80 hover:bg-ai-secondary hover:text-ai-primary',
  },
}

export function productNavRowClass(
  key: ProductIconKey,
  opts: { active: boolean },
): string {
  const s = productSurface[key]
  return cn(baseRow, opts.active ? s.active : s.hover)
}

/** Цвет шеврона у раскрывающегося пункта, когда среди детей есть активный маршрут. */
const chevronWhenGroupActive: Record<ProductIconKey, string> = {
  meetings: 'text-meetings-primary',
  messenger: 'text-messenger-primary',
  drive: 'text-drive-primary',
  mail: 'text-mail-primary',
  boards: 'text-board-primary',
  calendar: 'text-mail-primary',
  'online-broadcasts': 'text-broadcasts-primary',
  rooms: 'text-rooms-primary',
  webinars: 'text-webinars-primary',
  'ai-assistent': 'text-ai-primary',
}

/** При hover строки — шеврон в цвете primary продукта (в покое как у Lucide: secondary/50). */
const chevronGroupHoverPrimary: Record<ProductIconKey, string> = {
  meetings: 'group-hover:text-meetings-primary',
  messenger: 'group-hover:text-messenger-primary',
  drive: 'group-hover:text-drive-primary',
  mail: 'group-hover:text-mail-primary',
  boards: 'group-hover:text-board-primary',
  calendar: 'group-hover:text-mail-primary',
  'online-broadcasts': 'group-hover:text-broadcasts-primary',
  rooms: 'group-hover:text-rooms-primary',
  webinars: 'group-hover:text-webinars-primary',
  'ai-assistent': 'group-hover:text-ai-primary',
}

export function productNavChevronClass(
  key: ProductIconKey,
  groupActive: boolean,
): string {
  return groupActive
    ? chevronWhenGroupActive[key]
    : cn('text-secondary/50', chevronGroupHoverPrimary[key])
}

/** Как у подпунктов без productIcon: только цвет текста, без фона. */
const productSubLinkActive: Record<ProductIconKey, string> = {
  meetings: 'font-medium text-meetings-primary',
  messenger: 'font-medium text-messenger-primary',
  drive: 'font-medium text-drive-primary',
  mail: 'font-medium text-mail-primary',
  boards: 'font-medium text-board-primary',
  calendar: 'font-medium text-mail-primary',
  'online-broadcasts': 'font-medium text-broadcasts-primary',
  rooms: 'font-medium text-rooms-primary',
  webinars: 'font-medium text-webinars-primary',
  'ai-assistent': 'font-medium text-ai-primary',
}

const productSubLinkInactive: Record<ProductIconKey, string> = {
  meetings: 'text-foreground hover:text-meetings-primary',
  messenger: 'text-foreground hover:text-messenger-primary',
  drive: 'text-foreground hover:text-drive-primary',
  mail: 'text-foreground hover:text-mail-primary',
  boards: 'text-foreground hover:text-board-primary',
  calendar: 'text-foreground hover:text-mail-primary',
  'online-broadcasts': 'text-foreground hover:text-broadcasts-primary',
  rooms: 'text-foreground hover:text-rooms-primary',
  webinars: 'text-foreground hover:text-webinars-primary',
  'ai-assistent': 'text-foreground hover:text-ai-primary',
}

const productSubLinkIndicator: Record<ProductIconKey, string> = {
  meetings: 'bg-meetings-primary',
  messenger: 'bg-messenger-primary',
  drive: 'bg-drive-primary',
  mail: 'bg-mail-primary',
  boards: 'bg-board-primary',
  calendar: 'bg-mail-primary',
  'online-broadcasts': 'bg-broadcasts-primary',
  rooms: 'bg-rooms-primary',
  webinars: 'bg-webinars-primary',
  'ai-assistent': 'bg-ai-primary',
}

/** Подпункты продукта: акцент через `*-primary`, без фона (как «Пользователи» и др.). */
export function productNavSubLinkClass(
  key: ProductIconKey,
  opts: { active: boolean },
): string {
  return opts.active ? productSubLinkActive[key] : productSubLinkInactive[key]
}

export function productNavSubLinkIndicatorClass(key: ProductIconKey): string {
  return productSubLinkIndicator[key]
}

/** Вертикальная направляющая дерева подменю у продуктовых разделов. */
const productSubTreeGuide: Record<ProductIconKey, string> = {
  meetings: 'bg-meetings-primary/35',
  messenger: 'bg-messenger-primary/35',
  drive: 'bg-drive-primary/35',
  mail: 'bg-mail-primary/35',
  boards: 'bg-board-primary/35',
  calendar: 'bg-mail-primary/35',
  'online-broadcasts': 'bg-broadcasts-primary/35',
  rooms: 'bg-rooms-primary/35',
  webinars: 'bg-webinars-primary/35',
  'ai-assistent': 'bg-ai-primary/35',
}

export function productNavSubTreeGuideClass(key: ProductIconKey): string {
  return productSubTreeGuide[key]
}
