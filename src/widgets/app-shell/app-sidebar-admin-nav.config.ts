import {
  Bell,
  Building2,
  FileCode2,
  HardDrive,
  LayoutPanelLeft,
  Mail,
  UserPlus,
  UsersRound,
} from 'lucide-vue-next'
import type { SidebarNavEntry } from './app-sidebar-nav.config'

export const adminNavMenuConfig: SidebarNavEntry[] = [
  {
    type: 'item',
    key: 'admin-dashboard',
    title: 'Рабочий стол',
    href: '/admin',
    icon: LayoutPanelLeft,
  },
  { type: 'divider', key: 'd-after-admin-dashboard' },
  {
    type: 'item',
    key: 'admin-mail',
    title: 'Почта и календарь',
    productIcon: 'mail',
    children: [
      { title: 'Управление доменами', href: '/admin/mail/domains' },
      { title: 'Управление почтовыми ящиками', href: '/admin/mail/mailboxes' },
      { title: 'Дополнительные настройки', href: '/admin/mail/settings' },
    ],
  },
  {
    type: 'item',
    key: 'admin-disk',
    title: 'Диск и документы',
    productIcon: 'drive',
    children: [
      { title: 'Общие настройки', href: '/admin/disk/settings' },
      { title: 'Квоты', href: '/admin/disk/quotas' },
      { title: 'Общие диски', href: '/admin/disk/shared' },
      { title: 'Общая корзина', href: '/admin/disk/trash' },
      { title: 'История', href: '/admin/disk/history' },
    ],
  },
  { type: 'divider', key: 'd-after-admin-company' },
  {
    type: 'item',
    key: 'admin-company',
    title: 'Профиль компании',
    icon: Building2,
    children: [
      { title: 'Общие настройки', href: '/admin/company/settings' },
      { title: 'Плательщики', href: '/admin/company/payers' },
      { title: 'Контактная информация', href: '/admin/company/contacts' },
    ],
  },
  {
    type: 'item',
    key: 'admin-users',
    title: 'Пользователи',
    href: '/admin/users',
    icon: UserPlus,
  },
  {
    type: 'item',
    key: 'admin-roles',
    title: 'Роли и доступы',
    href: '/admin/roles',
    icon: UsersRound,
  },
  {
    type: 'item',
    key: 'admin-integrations',
    title: 'Интеграции',
    icon: FileCode2,
    children: [
      { title: 'LDAP / SSO', href: '/admin/integrations/ldap' },
      { title: 'API', href: '/admin/integrations/api' },
    ],
  },
  {
    type: 'item',
    key: 'admin-notifications',
    title: 'Уведомления',
    href: '/admin/notifications',
    icon: Bell,
  },
  
]
