import {
  Analytics01Icon,
  ApiIcon,
  Briefcase01Icon,
  ComputerVideoCallIcon,
  CreditCardIcon,
  DashboardSpeed01Icon,
  DashboardSquare01Icon,
  Delete02Icon,
  FolderLibraryIcon,
  FolderShared01Icon,
  LibraryIcon,
  TimelineListIcon,
  WebDesign01Icon,
  HierarchyFilesIcon,
  Home04Icon,
  InboxIcon,
  BookOpen01Icon,
  Mic02Icon,
  Package01Icon,
  Profile02Icon,
  ProfileIcon,
  ServerStack01Icon,
  ShieldKeyIcon,
  Tag01Icon,
  UserMultiple02Icon,
} from '@hugeicons/core-free-icons'
import type { IconArray } from '@hugeicons/vue'
import type { Component } from 'vue'
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import type { ProductIconKey } from './app-sidebar-nav-product-icons'

export type { ProductIconKey } from './app-sidebar-nav-product-icons'

export type SidebarNavDivider = {
  type: 'divider'
  key: string
}

export type SidebarNavSubDivider = {
  type: 'divider'
  key: string
}

export type SidebarNavSubItem = {
  title: string
  /** Внутренний маршрут; не нужен, если задан только externalUrl. */
  href?: string
  disabled?: boolean
  /** Подпункт открывается в новой вкладке (без иконки в списке, как у внутренних подпунктов). */
  externalUrl?: string
  icon?: IconArray | Component
}

export type SidebarNavSubEntry = SidebarNavSubItem | SidebarNavSubDivider

export function isSidebarNavSubDivider(sub: SidebarNavSubEntry): sub is SidebarNavSubDivider {
  return 'type' in sub && sub.type === 'divider'
}

export type SidebarNavMenuItem = {
  type: 'item'
  key: string
  title: string
  /** Внутренний маршрут (NuxtLink). */
  href?: string
  /** Внешняя ссылка: новая вкладка + иконка arrow-up-right, как в Figma. */
  externalUrl?: string
  icon?: IconArray | Component
  productIcon?: ProductIconKey
  disabled?: boolean
  tooltip?: string
  defaultOpen?: boolean
  children?: SidebarNavSubEntry[]
  /** Шеврон и раскрытие без подпунктов (подпункты добавятся позже). */
  expandable?: boolean
}

export type SidebarNavSection = {
  type: 'section'
  key: string
  /** Заголовок секции; если не задан — секция без подписи. */
  title?: string
  items: SidebarNavMenuItem[]
}

export type SidebarNavEntry = SidebarNavDivider | SidebarNavMenuItem | SidebarNavSection

/** Пользовательское меню сайдбара — наполняется постепенно с нуля. */
export const navMenuConfig: SidebarNavEntry[] = [
  {
    type: 'section',
    key: 'main',
    items: [
      {
        type: 'item',
        key: 'dashboard',
        title: 'Рабочий стол',
        href: '/',
        icon: Home04Icon,
      },
      {
        type: 'item',
        key: 'admin-panel',
        title: 'Панель администратора',
        href: '/admin',
        icon: DashboardSpeed01Icon,
      },
    ],
  },
  {
    type: 'section',
    key: 'subscriptions',
    title: 'Подписки',
    items: [
      {
        type: 'item',
        key: 'meetings-webinars',
        title: 'Встречи и вебинары',
        productIcon: 'meetings',
        expandable: true,
        children: [
          { title: 'Встречи', href: '/meetings', icon: Mic02Icon },
          { title: 'Вебинары', href: '/meetings/webinars', icon: ComputerVideoCallIcon },
          { title: 'Комнаты', href: '/meetings/rooms', icon: DashboardSquare01Icon },
        ],
      },
      {
        type: 'item',
        key: 'drive',
        title: 'Диск и документы',
        productIcon: 'drive',
        expandable: true,
        children: [
          { title: 'Мои файлы', href: '/drive', icon: FolderLibraryIcon },
          { title: 'Корп. пространство', href: '/drive/team', icon: HierarchyFilesIcon },
          { type: 'divider', key: 'drive-sub-divider' },
          { title: 'Есть доступ', href: '/drive/shared', icon: FolderShared01Icon },
          { title: 'Корзина', href: '/drive/trash', icon: Delete02Icon },
        ],
      },
      {
        type: 'item',
        key: 'mail',
        title: 'Почта и календарь',
        productIcon: 'mail',
        expandable: true,
        children: [
          { title: 'Почтовые ящики', href: '/mail', icon: InboxIcon },
          { title: 'Почтовые домены', href: '/mail/domains', icon: WebDesign01Icon },
        ],
      },
      {
        type: 'item',
        key: 'messenger',
        title: 'Мессенджер',
        productIcon: 'messenger',
        externalUrl: `${IVA360_PRODUCT_ORIGIN}/messenger`,
      },
      {
        type: 'item',
        key: 'board',
        title: 'Интерактивная доска',
        productIcon: 'boards',
        externalUrl: `${IVA360_PRODUCT_ORIGIN}/board`,
      },
    ],
  },
  {
    type: 'section',
    key: 'users',
    title: 'Пользователи',
    items: [
      {
        type: 'item',
        key: 'users-employees',
        title: 'Управление пользователями',
        href: '/users/employees',
        icon: UserMultiple02Icon,
      },
      {
        type: 'item',
        key: 'profile',
        title: 'Мой профиль',
        href: '/profile',
        icon: Profile02Icon,
      },
    ],
  },
  {
    type: 'section',
    key: 'integrations',
    title: 'Интеграции',
    items: [
      {
        type: 'item',
        key: 'integrations-ldap',
        title: 'Настройки LDAP',
        href: '/integration/ldap',
        icon: ServerStack01Icon,
      },
      {
        type: 'item',
        key: 'integrations-sso',
        title: 'Настройки SSO',
        href: '/integration/sso',
        icon: ShieldKeyIcon,
      },
      {
        type: 'item',
        key: 'integrations-api',
        title: 'Настройки API',
        href: '/integration/api',
        icon: ApiIcon,
      },
    ],
  },
  {
    type: 'section',
    key: 'billing',
    title: 'Подписки и заказы',
    items: [
      {
        type: 'item',
        key: 'users-subscriptions',
        title: 'Управление подписками',
        href: '/users/products',
        icon: ProfileIcon,
      },
      {
        type: 'item',
        key: 'billing-subscriptions',
        title: 'Мои подписки',
        href: '/billing/products',
        icon: CreditCardIcon,
      },
      {
        type: 'item',
        key: 'billing-orders',
        title: 'Мои заказы',
        href: '/billing/orders',
        icon: Package01Icon,
      },
    ],
  },
  {
    type: 'section',
    key: 'company-management',
    title: 'Управление компанией',
    items: [
      {
        type: 'item',
        key: 'company',
        title: 'Моя компания',
        href: '/company',
        icon: Briefcase01Icon,
      },
      {
        type: 'item',
        key: 'statistics',
        title: 'Статистика',
        href: '/statistics',
        icon: Analytics01Icon,
      },
      {
        type: 'item',
        key: 'tariffs',
        title: 'Тарифы',
        externalUrl: `${IVA360_PRODUCT_ORIGIN}/tariffs`,
        icon: Tag01Icon,
      },
    ],
  },
  {
    type: 'section',
    key: 'documents',
    title: 'Документы',
    items: [
      {
        type: 'item',
        key: 'roadmap',
        title: 'Дорожная карта',
        href: '/roadmap',
        icon: TimelineListIcon,
      },
      {
        type: 'item',
        key: 'platform-docs',
        title: 'Документы платформы',
        href: '/platform-docs',
        icon: LibraryIcon,
      },
      {
        type: 'item',
        key: 'kb',
        title: 'База знаний',
        externalUrl: `${IVA360_PRODUCT_ORIGIN}/docs`,
        icon: BookOpen01Icon,
      },
    ],
  },
]
