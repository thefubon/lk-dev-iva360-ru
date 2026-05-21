import { Shield, User, UserRound } from 'lucide-vue-next'
import type {
  CompanyRole,
  PermissionCategory,
  PermissionLevel,
  RolesMatrixSnapshot,
} from './types'

export const COMPANY_ROLES: CompanyRole[] = [
  {
    id: 'adm',
    name: 'Администратор',
    icon: Shield,
    memberCount: 4,
  },
  {
    id: 'usr',
    name: 'Пользователь',
    icon: User,
    memberCount: 236,
  },
  {
    id: 'gst',
    name: 'Гость',
    icon: UserRound,
    memberCount: 4,
  },
]

const ROLE_IDS = COMPANY_ROLES.map((role) => role.id)

function levels(
  values: Record<string, PermissionLevel>,
): Record<string, PermissionLevel> {
  const result: Record<string, PermissionLevel> = {}
  for (const roleId of ROLE_IDS) {
    result[roleId] = values[roleId] ?? 0
  }
  return result
}

function row(
  id: string,
  name: string,
  values: Record<string, PermissionLevel>,
) {
  return { id, name, levels: levels(values) }
}

export const DEFAULT_PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'company-billing',
    name: 'Компания и биллинг',
    items: [
      row('company-profile', 'Профиль компании', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('payers', 'Плательщики', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('orders-invoices', 'Заказы и счета', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('documents', 'Документы', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('subscription', 'Управление подпиской', {
        adm: 0, usr: 0, gst: 0,
      }),
    ],
  },
  {
    id: 'menu-visibility',
    name: 'Видимость разделов меню',
    items: [
      row('menu-users', 'Раздел: Пользователи', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('menu-roles', 'Раздел: Роли и доступы', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('menu-security', 'Раздел: Безопасность', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('menu-ldap', 'Раздел: LDAP / SSO', {
        adm: 0, usr: 0, gst: 0,
      }),
      row('menu-notifications', 'Раздел: Уведомления', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('menu-products', 'Раздел: Продукты (Почта, Диск...)', {
        adm: 2, usr: 0, gst: 0,
      }),
    ],
  },
  {
    id: 'users',
    name: 'Пользователи',
    items: [
      row('users-create-delete', 'Создание / удаление пользователей', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('users-reset-password', 'Сброс паролей', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('users-block', 'Блокировка', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('users-list', 'Просмотр списка', {
        adm: 2, usr: 0, gst: 0,
      }),
    ],
  },
  {
    id: 'mail',
    name: 'Почта',
    items: [
      row('mail-domains', 'Управление доменами', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('mail-mailboxes', 'Создание / удаление ящиков', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('mail-reset-password', 'Сброс пароля ящика', {
        adm: 2, usr: 1, gst: 0,
      }),
      row('mail-use', 'Использование почты', {
        adm: 2, usr: 2, gst: 0,
      }),
      row('mail-imap', 'Пароль приложения (IMAP)', {
        adm: 2, usr: 2, gst: 0,
      }),
    ],
  },
  {
    id: 'disk',
    name: 'Диск',
    items: [
      row('disk-quotas', 'Управление квотами', {
        adm: 2, usr: 0, gst: 0,
      }),
      row('disk-upload', 'Загрузка файлов', {
        adm: 2, usr: 2, gst: 0,
      }),
      row('disk-shared', 'Общие диски (создание)', {
        adm: 2, usr: 1, gst: 0,
      }),
    ],
  },
]

export function cloneMatrixSnapshot(
  categories: PermissionCategory[],
): RolesMatrixSnapshot {
  return {
    categories: categories.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        levels: { ...item.levels },
      })),
    })),
  }
}

export function createInitialMatrixSnapshot(): RolesMatrixSnapshot {
  return cloneMatrixSnapshot(DEFAULT_PERMISSION_CATEGORIES)
}
