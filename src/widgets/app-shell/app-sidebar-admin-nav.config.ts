import {
  ApiIcon,
  ContactBookIcon,
  CreditCardIcon,
  Delete02Icon,
  FolderShared01Icon,
  Home04Icon,
  InboxIcon,
  MailSetting01Icon,
  Notification03Icon,
  PieChart01Icon,
  ServerStack01Icon,
  Settings01Icon,
  TimelineListIcon,
  UserAdd01Icon,
  UserShield01Icon,
  WebDesign01Icon,
} from '@hugeicons/core-free-icons'
import type { SidebarNavEntry } from './app-sidebar-nav.config'

export const adminNavMenuConfig: SidebarNavEntry[] = [
  {
    type: 'section',
    key: 'admin-main',
    items: [
      {
        type: 'item',
        key: 'admin-dashboard',
        title: 'Рабочий стол',
        href: '/admin',
        icon: Home04Icon,
      },
    ],
  },
  {
    type: 'section',
    key: 'admin-products',
    items: [
      {
        type: 'item',
        key: 'admin-disk',
        title: 'Диск и документы',
        productIcon: 'drive',
        expandable: true,
        children: [
          { title: 'Общие настройки', href: '/admin/disk/settings', icon: Settings01Icon },
          { title: 'Квоты', href: '/admin/disk/quotas', icon: PieChart01Icon },
          { title: 'Общие диски', href: '/admin/disk/shared', icon: FolderShared01Icon },
          { title: 'Общая корзина', href: '/admin/disk/trash', icon: Delete02Icon },
          { title: 'История', href: '/admin/disk/history', icon: TimelineListIcon },
        ],
      },
      {
        type: 'item',
        key: 'admin-mail',
        title: 'Почта и календарь',
        productIcon: 'mail',
        expandable: true,
        children: [
          { title: 'Почтовые ящики', href: '/admin/mail/mailboxes', icon: InboxIcon },
          { title: 'Почтовые домены', href: '/admin/mail/domains', icon: WebDesign01Icon },
          { title: 'Настройки', href: '/admin/mail/settings', icon: MailSetting01Icon },
        ],
      },
    ],
  },
  {
    type: 'section',
    key: 'admin-company',
    title: 'Профиль компании',
    items: [
      {
        type: 'item',
        key: 'admin-company-settings',
        title: 'Общие настройки',
        href: '/admin/company/settings',
        icon: Settings01Icon,
      },
      {
        type: 'item',
        key: 'admin-company-payers',
        title: 'Плательщики',
        href: '/admin/company/payers',
        icon: CreditCardIcon,
      },
      {
        type: 'item',
        key: 'admin-company-contacts',
        title: 'Контактная информация',
        href: '/admin/company/contacts',
        icon: ContactBookIcon,
      },
    ],
  },
  {
    type: 'section',
    key: 'admin-users',
    title: 'Пользователи',
    items: [
      {
        type: 'item',
        key: 'admin-users',
        title: 'Пользователи',
        href: '/admin/users',
        icon: UserAdd01Icon,
      },
      {
        type: 'item',
        key: 'admin-roles',
        title: 'Роли и доступы',
        href: '/admin/roles',
        icon: UserShield01Icon,
      },
    ],
  },
  {
    type: 'section',
    key: 'admin-integrations',
    title: 'Интеграции',
    items: [
      {
        type: 'item',
        key: 'admin-integrations-ldap',
        title: 'LDAP / SSO',
        href: '/admin/integrations/ldap',
        icon: ServerStack01Icon,
      },
      {
        type: 'item',
        key: 'admin-integrations-api',
        title: 'API',
        href: '/admin/integrations/api',
        icon: ApiIcon,
      },
    ],
  },
  {
    type: 'section',
    key: 'admin-notifications',
    title: 'Уведомления',
    items: [
      {
        type: 'item',
        key: 'admin-notifications',
        title: 'Уведомления',
        href: '/admin/notifications',
        icon: Notification03Icon,
      },
    ],
  },
]
