import {
  Blocks,
  BookMarked,
  Briefcase,
  Building2,
  ChartNoAxesColumnIncreasing,
  CreditCard,
  FileCode2,
  FolderOpen,
  LayoutPanelLeft,
  Library,
  ListTodo,
  User,
  UserPlus,
} from 'lucide-vue-next'
import { IVA360_PRODUCT_ORIGIN } from '@lib/iva360-external-origin'
import type { SidebarNavDivider, SidebarNavMenuItem } from '../../app-sidebar-nav.config'

export type ArchivedSidebarNavEntry = SidebarNavDivider | SidebarNavMenuItem

const EXTERNAL_ORIGIN = IVA360_PRODUCT_ORIGIN

/**
 * Архивная конфигурация пользовательского меню сайдбара (до пересборки с нуля).
 * @see ../../app-sidebar-nav.config.ts — актуальные типы и пустой массив
 */
export const navMenuConfig: ArchivedSidebarNavEntry[] = [
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
    key: 'drive',
    title: 'Диск и документы',
    productIcon: 'drive',
    children: [
      { title: 'Мои файлы', href: '/drive', icon: FolderOpen },
      { title: 'Корпоративное пространство', href: '/drive/team', icon: Building2 },
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
    key: 'messenger',
    title: 'Мессенджер',
    productIcon: 'messenger',
    externalUrl: `${EXTERNAL_ORIGIN}/messenger`,
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
