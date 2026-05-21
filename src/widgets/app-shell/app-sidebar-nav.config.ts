import type { Component } from 'vue'
import {
  Blocks,
  BookMarked,
  Briefcase,
  ChartNoAxesColumnIncreasing,
  CreditCard,
  FileCode2,
  LayoutPanelLeft,
  Library,
  ListTodo,
  User,
  UserPlus,
} from 'lucide-vue-next'
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import type { ProductIconKey } from './app-sidebar-nav-product-icons'

export type { ProductIconKey } from './app-sidebar-nav-product-icons'

export type SidebarNavDivider = {
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
}

export type SidebarNavMenuItem = {
  type: 'item'
  key: string
  title: string
  /** Внутренний маршрут (NuxtLink). */
  href?: string
  /** Внешняя ссылка: новая вкладка + иконка arrow-up-right, как в Figma. */
  externalUrl?: string
  icon?: Component
  productIcon?: ProductIconKey
  disabled?: boolean
  tooltip?: string
  defaultOpen?: boolean
  children?: SidebarNavSubItem[]
  /** Шеврон и раскрытие без подпунктов (подпункты добавятся позже). */
  expandable?: boolean
}

export type SidebarNavEntry = SidebarNavDivider | SidebarNavMenuItem

const EXTERNAL_ORIGIN = IVA360_PRODUCT_ORIGIN

/**
 * Навигация по макету Figma (node 25614:41224): порядок, названия, разделители,
 * продуктовые иконки из `app/assets/img/icons/solid/`, Lucide для остальных.
 * Внешние URL — заглушки на домен продукта; замените на реальные сервисы.
 */
export const navMenuConfig: SidebarNavEntry[] = [
  {
    type: 'item',
    key: 'dashboard',
    title: 'Рабочий стол',
    href: '/',
    icon: LayoutPanelLeft,
  },
  { type: 'divider', key: 'd-after-dashboard' },

  {
    type: 'item',
    key: 'meetings',
    title: 'Встречи и вебинары',
    productIcon: 'meetings',
    children: [
      { title: 'Встречи', href: '/meetings' },
      { title: 'Вебинары', href: '/meetings/webinars' },
      { title: 'Комнаты', href: '/meetings/rooms' },
    ],
  },
  {
    type: 'item',
    key: 'messenger',
    title: 'Мессенджер',
    productIcon: 'messenger',
    externalUrl: `${EXTERNAL_ORIGIN}/messenger`,
  },
  {
    type: 'item',
    key: 'drive',
    title: 'Диск и документы',
    productIcon: 'drive',
    children: [
      { title: 'Мои файлы', href: '/drive' },
      { title: 'Корпоративное пространство', href: '/drive/team' },
      { title: 'Есть доступ', href: '/drive/shared' },
      { title: 'Корзина', href: '/drive/trash' },
    ],
  },
  {
    type: 'item',
    key: 'mail',
    title: 'Почта и календарь',
    productIcon: 'mail',
    children: [
      { title: 'Почтовые ящики', href: '/mail' },
      { title: 'Почтовые домены', href: '/mail/domains' },
    ],
  },
  {
    type: 'item',
    key: 'board',
    title: 'Интерактивная доска',
    productIcon: 'boards',
    externalUrl: `${EXTERNAL_ORIGIN}/board`,
  },
  { type: 'divider', key: 'd-after-products' },

  {
    type: 'item',
    key: 'users',
    title: 'Пользователи',
    icon: UserPlus,
    defaultOpen: true,
    children: [
      { title: 'Сотрудники', href: '/users/employees' },
      { title: 'Подписки', href: '/users/products' },
    ],
  },
  {
    type: 'item',
    key: 'integration',
    title: 'Интеграции',
    icon: FileCode2,
    children: [
      { title: 'Обзор', href: '/integration' },
      { title: 'Настройки API', href: '/integration/api' },
      { title: 'Настройки LDAP', href: '/integration/ldap' },
      { title: 'Настройки SSO', href: '/integration/sso' },
    ],
  },
  {
    type: 'item',
    key: 'profile',
    title: 'Мой профиль',
    icon: User,
    href: '/profile',
  },
  { type: 'divider', key: 'd-after-admin' },

  {
    type: 'item',
    key: 'company',
    title: 'Моя компания',
    icon: Briefcase,
    href: '/company',
  },
  {
    type: 'item',
    key: 'products-orders',
    title: 'Подписки и заказы',
    icon: Blocks,
    children: [
      /** Отдельный URL от «Пользователи → Подписки» (`/users/products`), чтобы активный пункт и контекст раздела не дублировались. */
      { title: 'Мои продукты', href: '/billing/products' },
      { title: 'Мои заказы', href: '/billing/orders' },
    ],
  },
  {
    type: 'item',
    key: 'tariffs',
    title: 'Тарифы',
    icon: CreditCard,
    externalUrl: `${EXTERNAL_ORIGIN}/tariffs`,
  },
  {
    type: 'item',
    key: 'statistics',
    title: 'Статистика',
    icon: ChartNoAxesColumnIncreasing,
    href: '/statistics',
  },
  { type: 'divider', key: 'd-after-billing' },

  {
    type: 'item',
    key: 'kb',
    title: 'База знаний',
    icon: BookMarked,
    externalUrl: `${EXTERNAL_ORIGIN}/docs`,
  },
  {
    type: 'item',
    key: 'roadmap',
    title: 'Дорожная карта',
    icon: ListTodo,
    href: '/roadmap',
  },
  {
    type: 'item',
    key: 'platform-docs',
    title: 'Документы платформы',
    icon: Library,
    href: '/platform-docs',
  },
]
