<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'
import { rankItem, rankings } from '@tanstack/match-sorter-utils'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileUp,
  ListTodo,
  ListX,
  Layers,
  ListFilter,
  PackageX,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
} from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { computed, h, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useResizeObserver, watchDebounced } from '@vueuse/core'
import { Button } from '@/shared/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Switch } from '@/shared/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@lib/utils'
import EmployeeTagsCell from '@/pages/users/ui/employee-tags-cell.vue'
import {
  productIconUrls,
  productIconUrlsDefault,
  type ProductIconKey,
} from '@/widgets/app-shell/app-sidebar-nav-product-icons'

const USERS_ROUTES = {
  employees: '/users/employees',
  products: '/users/products',
} as const

const COLUMN_LABELS: Record<string, string> = {
  fullName: 'Имя / Фамилия',
  department: 'Отдел',
  position: 'Должность',
  tags: 'Тег',
  subscriptions: 'Подписки',
  actions: 'Изменить',
}

function isNarrowColumn(id: string) {
  return id === 'subscriptions' || id === 'actions'
}

/** Отдел и должность — одна ширина; «Тег» уже, «Подписки» отдельно. */
const EMPLOYEE_TABLE_EQUAL_WIDTH_COLUMN_IDS = new Set<string>(['department', 'position'])

function isEmployeeTableEqualWidthColumn(id: string) {
  return EMPLOYEE_TABLE_EQUAL_WIDTH_COLUMN_IDS.has(id)
}

/**
 * Только продуктовый блок сайдбара (как в `navMenuConfig` до «Пользователи»):
 * без переговорных / вебинаров отдельно — они в составе «Встречи и вебинары».
 */
const SUBSCRIPTION_STACK_POOL = [
  'meetings',
  'messenger',
  'drive',
  'mail',
  'boards',
] as const

type SubscriptionSidebarProductKey = (typeof SUBSCRIPTION_STACK_POOL)[number]

const PRODUCT_SUBSCRIPTION_LABELS: Record<SubscriptionSidebarProductKey, string> = {
  meetings: 'Встречи и вебинары',
  messenger: 'Мессенджер',
  drive: 'Диск и документы',
  mail: 'Почта и календарь',
  boards: 'Интерактивная доска',
}

const subscriptionProductChipClass: Record<SubscriptionSidebarProductKey, string> = {
  meetings: 'bg-meetings-secondary',
  messenger: 'bg-messenger-secondary',
  drive: 'bg-drive-secondary',
  mail: 'bg-mail-secondary',
  boards: 'bg-board-secondary',
}

/** Фон чипа по ключу иконки (вебинары ≠ встречи при том же `chip: meetings`). */
const addUserPlanIconBgClass: Record<ProductIconKey, string> = {
  meetings: 'bg-meetings-secondary',
  messenger: 'bg-messenger-secondary',
  drive: 'bg-drive-secondary',
  mail: 'bg-mail-secondary',
  boards: 'bg-board-secondary',
  calendar: 'bg-mail-secondary',
  'online-broadcasts': 'bg-broadcasts-secondary',
  rooms: 'bg-rooms-secondary',
  webinars: 'bg-webinars-secondary',
  'ai-assistent': 'bg-ai-secondary',
}

/** Демо-каталог тарифов: код (SKU), иконка, лимит подключений пользователей (как в Figma). */
const ADD_USER_PLAN_CATALOG: {
  code: string
  chip: SubscriptionSidebarProductKey
  icon: ProductIconKey
  connectionsUsed: number
  connectionsLimit: number
}[] = [
  { code: 'MEET-10', chip: 'meetings', icon: 'meetings', connectionsUsed: 10, connectionsLimit: 51 },
  { code: 'MEET-25', chip: 'meetings', icon: 'meetings', connectionsUsed: 5, connectionsLimit: 50 },
  { code: 'MEET-50', chip: 'meetings', icon: 'meetings', connectionsUsed: 25, connectionsLimit: 100 },
  { code: 'MEET-100', chip: 'meetings', icon: 'meetings', connectionsUsed: 0, connectionsLimit: 50 },
  { code: 'WEB-25', chip: 'meetings', icon: 'webinars', connectionsUsed: 8, connectionsLimit: 40 },
  { code: 'WEB-100', chip: 'meetings', icon: 'webinars', connectionsUsed: 42, connectionsLimit: 100 },
  { code: 'WEB-150', chip: 'meetings', icon: 'webinars', connectionsUsed: 0, connectionsLimit: 100 },
  { code: 'MESSENGER+', chip: 'messenger', icon: 'messenger', connectionsUsed: 18, connectionsLimit: 30 },
  { code: 'MSG-PRO', chip: 'messenger', icon: 'messenger', connectionsUsed: 3, connectionsLimit: 25 },
  { code: 'DRIVE-10', chip: 'drive', icon: 'drive', connectionsUsed: 12, connectionsLimit: 51 },
  { code: 'DRIVE-25', chip: 'drive', icon: 'drive', connectionsUsed: 7, connectionsLimit: 50 },
  { code: 'DRIVE-50', chip: 'drive', icon: 'drive', connectionsUsed: 31, connectionsLimit: 75 },
  { code: 'MAIL-5', chip: 'mail', icon: 'mail', connectionsUsed: 2, connectionsLimit: 20 },
  { code: 'MAIL-25', chip: 'mail', icon: 'mail', connectionsUsed: 15, connectionsLimit: 51 },
  { code: 'BRD-01', chip: 'boards', icon: 'boards', connectionsUsed: 1, connectionsLimit: 10 },
  { code: 'BRD-10', chip: 'boards', icon: 'boards', connectionsUsed: 9, connectionsLimit: 25 },
]

const addUserPlanCatalogIndex = Object.fromEntries(
  ADD_USER_PLAN_CATALOG.map((r, i) => [r.code, i]),
) as Record<string, number>

const subscriptionProductOrder = Object.fromEntries(
  SUBSCRIPTION_STACK_POOL.map((k, i) => [k, i]),
) as Record<SubscriptionSidebarProductKey, number>

type SubscriptionStackItem = {
  product: SubscriptionSidebarProductKey
  label: string
  /**
   * Демо: доп. варианты / тарифы (например MEET-10 и MEET-50) — в тултипе бейдж +N.
   * 0 — бейдж не показываем.
   */
  extraVariants: number
}

type Employee = {
  id: string
  fullName: string
  email: string
  /** Демо: SVG-аватар (DiceBear), единый «европейский» тип лица, без смешения этносов randomuser. */
  avatarUrl: string
  /** Демо: пол по имени, чтобы портрет совпадал с именем. */
  gender: 'female' | 'male'
  department: string
  position: string
  tags: string
  subscriptions: number
  /** Демо: до 5 продуктовых иконок в стопке «подписки». */
  subscriptionStack: SubscriptionStackItem[]
  phone: string
  role: string
  adSync?: boolean
  /** Демо: приглашение в организацию принято (для сегментов в шапке). */
  invitationAccepted: boolean
}

const departments = ['Маркетинг', 'Продажи', 'Разработка', 'HR', 'Финансы', 'Поддержка']
const positions = ['Менеджер', 'Директор', 'Инженер', 'Аналитик', 'Специалист', 'Руководитель']
const firstNames = [
  'Анна', 'Иван', 'Мария', 'Алексей', 'Елена', 'Дмитрий', 'Ольга', 'Сергей', 'Татьяна', 'Павел',
  'Наталья', 'Андрей', 'Юлия', 'Константин', 'Виктория', 'Михаил', 'Светлана', 'Роман', 'Ирина', 'Глеб',
]

/** Женские имена из `firstNames` (остальные в демо считаем мужскими). */
const DEMO_FEMALE_FIRST_NAMES = new Set<string>([
  'Анна',
  'Мария',
  'Елена',
  'Ольга',
  'Татьяна',
  'Наталья',
  'Юлия',
  'Виктория',
  'Светлана',
  'Ирина',
])

function demoGenderFromFirstName(firstName: string): 'female' | 'male' {
  return DEMO_FEMALE_FIRST_NAMES.has(firstName) ? 'female' : 'male'
}

const lastNames = [
  'Смирнова', 'Петров', 'Козлова', 'Соколов', 'Новикова', 'Морозов', 'Волкова', 'Лебедев', 'Орлова', 'Семёнов',
  'Егорова', 'Кузнецов', 'Соловьёва', 'Васильев', 'Макарова', 'Фёдоров', 'Захарова', 'Белов', 'Комарова', 'Никитин',
]

const demoPhones = [
  '+7 (903) 134-86-36',
  '+7 (916) 221-44-09',
  '+7 (495) 100-20-30',
  '+7 (812) 555-01-22',
]

function initialsFromFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? '?'
  const b = parts[1]?.[0] ?? ''
  return `${a}${b}`.toUpperCase()
}

/**
 * Демо: стилизованные лица в духе восточно-европейской внешности (DiceBear lorelei / personas),
 * без фотостока с разным этносом; seed стабилен по id и ФИО.
 */
function employeeDemoSlavicStyleAvatarUrl(
  fullName: string,
  gender: 'female' | 'male',
  employeeId: string,
): string {
  const seed = encodeURIComponent(`${employeeId}-${fullName}`)
  const style = gender === 'female' ? 'lorelei' : 'personas'
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=f1f5f9`
}

function displayEmployeeNumericId(id: string) {
  const n = Number.parseInt(id.replace(/\D+/g, ''), 10)
  return Number.isFinite(n) ? String(n) : id
}

const MONTH_NAMES_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const

/** Предложный падеж («в мае …»). */
const MONTH_NAMES_PREP = [
  'январе',
  'феврале',
  'марте',
  'апреле',
  'мае',
  'июне',
  'июле',
  'августе',
  'сентябре',
  'октябре',
  'ноябре',
  'декабре',
] as const

const MAX_CONTACT_YEAR = 2026

function hashEmployeeId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Демо: 1–5 продуктовых иконок в стопке, стабильно по id пользователя; порядок как в сайдбаре. */
function buildSubscriptionStack(employeeId: string): SubscriptionStackItem[] {
  const h = hashEmployeeId(employeeId)
  const n = 1 + (h % 5)
  const orderIdx = [0, 1, 2, 3, 4]
  for (let i = orderIdx.length - 1; i > 0; i--) {
    const j = ((h >>> 8) + i * 31) % (i + 1)
    const a = orderIdx[i]!
    const b = orderIdx[j]!
    orderIdx[i] = b
    orderIdx[j] = a
  }
  const picked = orderIdx.slice(0, n).sort((a, b) => a - b)
  return picked.map((idx, k) => {
    const product = SUBSCRIPTION_STACK_POOL[idx]!
    return {
      product,
      label: PRODUCT_SUBSCRIPTION_LABELS[product],
      extraVariants: Math.min(4, ((h >>> (k * 4 + 2)) % 5)),
    }
  })
}

/** Тарифы каталога по продукту (`chip`). */
function catalogPlansByChip(chip: SubscriptionSidebarProductKey) {
  return ADD_USER_PLAN_CATALOG.filter((r) => r.chip === chip)
}

/** Демо: коды тарифов из стека сотрудника — предзаполнение формы редактирования. */
function inferPlanCodesFromEmployee(e: Employee): string[] {
  const codes: string[] = []
  for (const item of e.subscriptionStack) {
    const candidates = catalogPlansByChip(item.product)
    if (candidates.length === 0) continue
    const cap = Math.min(1 + item.extraVariants, candidates.length)
    for (let i = 0; i < cap; i++) {
      const c = candidates[i]!.code
      if (!codes.includes(c)) codes.push(c)
    }
  }
  return codes
}

/** Демо: стек подписок из выбранных в форме кодов тарифов. */
function subscriptionStackFromSelectedPlanCodes(codes: string[]): SubscriptionStackItem[] {
  const rows = codes
    .map((code) => ADD_USER_PLAN_CATALOG.find((r) => r.code === code))
    .filter((r): r is (typeof ADD_USER_PLAN_CATALOG)[number] => r != null)
  const countByChip = new Map<SubscriptionSidebarProductKey, number>()
  for (const r of rows) {
    countByChip.set(r.chip, (countByChip.get(r.chip) ?? 0) + 1)
  }
  const out: SubscriptionStackItem[] = []
  for (const chip of SUBSCRIPTION_STACK_POOL) {
    const n = countByChip.get(chip)
    if (!n) continue
    out.push({
      product: chip,
      label: PRODUCT_SUBSCRIPTION_LABELS[chip],
      extraVariants: Math.max(0, n - 1),
    })
  }
  return out
}

function ruMinutesPhrase(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} минут`
  const mod10 = n % 10
  if (mod10 === 1) return `${n} минуту`
  if (mod10 >= 2 && mod10 <= 4) return `${n} минуты`
  return `${n} минут`
}

function ruHoursPhrase(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} часов`
  const mod10 = n % 10
  if (mod10 === 1) return `${n} час`
  if (mod10 >= 2 && mod10 <= 4) return `${n} часа`
  return `${n} часов`
}

function ruDaysPhrase(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} дней`
  const mod10 = n % 10
  if (mod10 === 1) return `${n} день`
  if (mod10 >= 2 && mod10 <= 4) return `${n} дня`
  return `${n} дней`
}

function ruWeeksPhrase(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return `${n} недель`
  const mod10 = n % 10
  if (mod10 === 1) return `${n} неделю`
  if (mod10 >= 2 && mod10 <= 4) return `${n} недели`
  return `${n} недель`
}

/** Дата в прошлом, не позже MAX_CONTACT_YEAR и не позже «сегодня». */
function clampPastContactDate(daysAgo: number): Date {
  const endCap = new Date(MAX_CONTACT_YEAR, 11, 31, 12, 0, 0, 0)
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  const ceilingMs = Math.min(now.getTime(), endCap.getTime())
  const ceiling = new Date(ceilingMs)
  const d = new Date(ceiling)
  d.setDate(d.getDate() - daysAgo)
  if (d.getTime() > ceiling.getTime()) return new Date(ceiling)
  return d
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Демо: стабильная относительно id подпись; календарных формулировок больше, чем «минут/часов назад». */
function contactAddedLabel(employeeId: string): string {
  const h = hashEmployeeId(employeeId)
  const n = (h >>> 8) % 10_000
  const bucket = h % 10

  switch (bucket) {
    case 0: {
      const minutes = 1 + (n % 59)
      return `Контакт был добавлен ${ruMinutesPhrase(minutes)} назад`
    }
    case 1: {
      const hours = 1 + (n % 72)
      return `Контакт был добавлен ${ruHoursPhrase(hours)} назад`
    }
    case 2: {
      const days = 1 + (n % 45)
      return `Контакт был добавлен ${ruDaysPhrase(days)} назад`
    }
    case 3:
    case 4:
    case 5: {
      const daysAgo = 15 + (n % 850)
      const d = clampPastContactDate(daysAgo)
      const day = d.getDate()
      const month = MONTH_NAMES_GEN[d.getMonth()] ?? 'месяца'
      const year = d.getFullYear()
      return `Контакт был добавлен ${day} ${month} ${year} г.`
    }
    case 6: {
      const daysAgo = 40 + ((n >>> 3) % 920)
      const d = clampPastContactDate(daysAgo)
      return `Контакт был добавлен ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} г.`
    }
    case 7: {
      const daysAgo = 1 + (n % 120)
      const d = clampPastContactDate(daysAgo)
      const monthPrep = MONTH_NAMES_PREP[d.getMonth()] ?? 'месяце'
      const year = d.getFullYear()
      return `Контакт был добавлен в ${monthPrep} ${year} г.`
    }
    case 8: {
      const sub = n % 5
      if (sub === 0) return 'Контакт был добавлен вчера'
      if (sub === 1) return 'Контакт был добавлен позавчера'
      if (sub === 2) {
        const weeks = 1 + (n % 12)
        return `Контакт был добавлен ${ruWeeksPhrase(weeks)} назад`
      }
      if (sub === 3) return 'Контакт был добавлен на прошлой неделе'
      return 'Контакт был добавлен в прошлом месяце'
    }
    default: {
      const year = 2019 + (n % (MAX_CONTACT_YEAR - 2019 + 1))
      const y = Math.min(year, MAX_CONTACT_YEAR)
      const sub = n % 3
      if (sub === 0) return `Контакт был добавлен в начале ${y} года`
      if (sub === 1) return `Контакт был добавлен во второй половине ${y} года`
      return `Контакт был добавлен в середине ${y} года`
    }
  }
}

/** Индексы строк (0-based) в полном списке пользователей с бейджем AD (демо). */
const DEMO_AD_SYNC_ROW_INDEXES = new Set([1, 5, 9, 13, 17, 21])

/** Демо: не приняли приглашение (остальные — приняты). */
const DEMO_INVITATION_PENDING_ROW_INDEXES = new Set([4, 11])

/** Демо: пользователи без подписок (0 и пустой стек) — для сегмента «Без подписок». */
const DEMO_ZERO_SUBSCRIPTION_ROW_INDEXES = new Set([2, 8, 19])

const DEMO_EMPLOYEE_COUNT = 26

/** Нет подключённых услуг: счётчик 0 или пустая стопка (кнопка «Подключить», сегмент «Без подписок»). */
function employeeNoSubscriptions(e: Employee): boolean {
  return e.subscriptions === 0 || e.subscriptionStack.length === 0
}

/** Несколько демо-строк (индекс 0-based) с малым числом подписок в счётчике (стопка продуктов как у остальных). */
const DEMO_LOW_SUBSCRIPTION_BY_ROW = new Map<number, 3 | 4 | 5>([
  [3, 5],
  [6, 3],
  [14, 4],
  [22, 5],
])

function buildEmployees(count: number): Employee[] {
  const rows: Employee[] = []
  for (let i = 0; i < count; i++) {
    const fn = firstNames[i % firstNames.length] ?? 'Пользователь'
    const ln = lastNames[i % lastNames.length] ?? 'Тестовый'
    const n = i + 1
    const gender = demoGenderFromFirstName(fn)
    const raw = 5 + ((i * 7) % 40)
    const defaultSubscriptions = Math.max(6, raw)
    const zeroSubs = DEMO_ZERO_SUBSCRIPTION_ROW_INDEXES.has(i)
    const subscriptions = zeroSubs
      ? 0
      : (DEMO_LOW_SUBSCRIPTION_BY_ROW.get(i) ?? defaultSubscriptions)
    const subscriptionStack = zeroSubs ? [] : buildSubscriptionStack(`emp-${n}`)
    rows.push({
      id: `emp-${n}`,
      fullName: `${fn} ${ln}`,
      email: `user${n}@example.org`,
      gender,
      avatarUrl: employeeDemoSlavicStyleAvatarUrl(`${fn} ${ln}`, gender, `emp-${n}`),
      department: departments[i % departments.length] ?? '—',
      position: positions[i % positions.length] ?? '—',
      tags:
        i === 0
          ? 'Тег 1, Тег 2, Тег 3, Тег 4, Тег 5'
          : i % 3 === 0
            ? 'Тег 1, Тег 2'
            : i % 3 === 1
              ? 'VIP'
              : '—',
      subscriptions,
      subscriptionStack,
      phone: demoPhones[i % demoPhones.length] ?? '—',
      role: i % 7 === 0 ? 'Администратор' : 'Пользователь',
      adSync: DEMO_AD_SYNC_ROW_INDEXES.has(i),
      invitationAccepted: !DEMO_INVITATION_PENDING_ROW_INDEXES.has(i),
    })
  }
  return rows
}

const fuzzyColumnFilter: FilterFn<Employee> = (row, columnId, filterValue, addMeta) => {
  if (filterValue == null || String(filterValue).trim() === '') return true
  const itemRank = rankItem(String(row.getValue(columnId)), String(filterValue))
  addMeta?.({ itemRank: itemRank })
  return itemRank.passed
}

/** Поиск только по ФИО и email: подстрока без «размазанного» MATCHES (иначе «анна» ловило «Константин…» по буквам по порядку). */
const fuzzyGlobalFilter: FilterFn<Employee> = (row, _columnId, filterValue, addMeta) => {
  if (filterValue == null || String(filterValue).trim() === '') return true
  const q = String(filterValue)
  const item = { fullName: row.original.fullName, email: row.original.email }
  const itemRank = rankItem(item, q, {
    threshold: rankings.CONTAINS,
    accessors: [
      (r: { fullName: string; email: string }) => r.fullName,
      (r: { fullName: string; email: string }) => r.email,
    ],
  })
  addMeta?.({ itemRank: itemRank })
  return itemRank.passed
}

const cellStringIncludes: FilterFn<Employee> = (row, columnId, filterValue) => {
  if (filterValue == null || String(filterValue).trim() === '') return true
  const cell = String(row.getValue(columnId)).toLowerCase()
  return cell.includes(String(filterValue).toLowerCase())
}

/** Мультивыбор по точному значению ячейки (отдел, должность, роль). */
const facetArrayIncludesFilter: FilterFn<Employee> = (row, columnId, filterValue) => {
  if (filterValue == null) return true
  if (!Array.isArray(filterValue)) return true
  const vals = filterValue as string[]
  if (vals.length === 0) return true
  const cell = String(row.getValue(columnId))
  return vals.includes(cell)
}

/** Теги в ячейке могут быть списком через запятую; совпадение по любому выбранному токену. */
const facetTagsAnyMatchFilter: FilterFn<Employee> = (row, _columnId, filterValue) => {
  if (filterValue == null) return true
  if (!Array.isArray(filterValue)) return true
  const vals = filterValue as string[]
  if (vals.length === 0) return true
  const raw = String(row.original.tags).trim()
  if (vals.includes(raw)) return true
  if (raw === '—') return vals.includes('—')
  const tokens = raw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
  return tokens.some((t) => vals.includes(t))
}

const data = ref<Employee[]>(buildEmployees(DEMO_EMPLOYEE_COUNT))

const headerSegmentCounts = computed(() => {
  const rows = data.value
  return {
    all: rows.length,
    accepted: rows.filter((e) => e.invitationAccepted).length,
    pending: rows.filter((e) => !e.invitationAccepted).length,
    ad: rows.filter((e) => e.adSync === true).length,
    noSubscriptions: rows.filter(employeeNoSubscriptions).length,
  }
})

const headerFilterScrollEl = ref<HTMLDivElement | null>(null)
const headerFilterScrollArrows = reactive({
  showLeft: false,
  showRight: false,
})

function updateHeaderFilterScrollArrows() {
  const el = headerFilterScrollEl.value
  if (!el) {
    headerFilterScrollArrows.showLeft = false
    headerFilterScrollArrows.showRight = false
    return
  }
  const max = el.scrollWidth - el.clientWidth
  if (max <= 1) {
    headerFilterScrollArrows.showLeft = false
    headerFilterScrollArrows.showRight = false
    return
  }
  const sl = el.scrollLeft
  headerFilterScrollArrows.showLeft = sl > 1
  headerFilterScrollArrows.showRight = sl < max - 1
}

function scrollHeaderFilters(dir: 'start' | 'end') {
  const el = headerFilterScrollEl.value
  if (!el) return
  const max = Math.max(0, el.scrollWidth - el.clientWidth)
  el.scrollTo({ left: dir === 'start' ? 0 : max, behavior: 'smooth' })
}

useResizeObserver(headerFilterScrollEl, () => {
  nextTick(updateHeaderFilterScrollArrows)
})

watch(headerSegmentCounts, () => nextTick(updateHeaderFilterScrollArrows), { deep: true })

onMounted(() => {
  nextTick(updateHeaderFilterScrollArrows)
})

const globalFilterInput = ref('')
const globalFilter = ref('')
const sorting = ref<SortingState>([])
const rowSelection = ref<RowSelectionState>({})
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})

type HeaderQuickSegment = 'all' | 'accepted' | 'pending' | 'ad' | 'no_subscriptions'

type HeaderQuickSegmentFilter = Exclude<HeaderQuickSegment, 'all'>

/** Те же сегменты, что на горизонтальных чипах, кроме «Все пользователи» — для выпадающего списка в попапе «Фильтры». */
const HEADER_QUICK_SEGMENT_FILTER_OPTIONS: { value: HeaderQuickSegmentFilter; label: string }[] = [
  { value: 'accepted', label: 'Принятые приглашения' },
  { value: 'pending', label: 'Не принятые приглашения' },
  { value: 'ad', label: 'Интеграции (AD, SSO, API)' },
  { value: 'no_subscriptions', label: 'Без подписок' },
]

const headerQuickSegment = ref<HeaderQuickSegment>('all')
/** Чекбокс «Пользователи» в попапе «Фильтры»: вкл — сегмент из выпадающего списка применяется к таблице. */
const headerUsersFilterActive = ref(false)

/** Фильтр по продуктам: чекбокс — строка активна; переключатель: выкл = без подписки на продукт, вкл = с подпиской. */
function createDefaultSubscriptionProductFilters(): Record<
  SubscriptionSidebarProductKey,
  { filterActive: boolean; requireHasSubscription: boolean }
> {
  return Object.fromEntries(
    SUBSCRIPTION_STACK_POOL.map((p) => [p, { filterActive: false, requireHasSubscription: false }]),
  ) as Record<SubscriptionSidebarProductKey, { filterActive: boolean; requireHasSubscription: boolean }>
}

const employeeSubscriptionProductFilters = reactive(createDefaultSubscriptionProductFilters())

const subscriptionFilterPopoverRows = SUBSCRIPTION_STACK_POOL.map((product) => ({
  product,
  label: PRODUCT_SUBSCRIPTION_LABELS[product],
  iconKey: product as ProductIconKey,
}))

const subscriptionsFilterPopoverOpen = ref(false)

const subscriptionFiltersBadgeCount = computed(() => {
  let n = 0
  for (const p of SUBSCRIPTION_STACK_POOL) {
    if (employeeSubscriptionProductFilters[p].filterActive) n += 1
  }
  return n
})

function employeeHasSubscriptionProduct(e: Employee, product: SubscriptionSidebarProductKey): boolean {
  return e.subscriptionStack.some((s) => s.product === product)
}

function employeeMatchesSubscriptionProductFilters(e: Employee): boolean {
  for (const p of SUBSCRIPTION_STACK_POOL) {
    const r = employeeSubscriptionProductFilters[p]
    if (!r.filterActive) continue
    const has = employeeHasSubscriptionProduct(e, p)
    if (r.requireHasSubscription !== has) return false
  }
  return true
}

function resetSubscriptionProductFilters() {
  Object.assign(employeeSubscriptionProductFilters, createDefaultSubscriptionProductFilters())
}

function employeeMatchesHeaderQuickSegment(e: Employee, seg: HeaderQuickSegment): boolean {
  if (seg === 'all') return true
  if (seg === 'accepted') return e.invitationAccepted === true
  if (seg === 'pending') return e.invitationAccepted === false
  if (seg === 'ad') return e.adSync === true
  if (seg === 'no_subscriptions') return employeeNoSubscriptions(e)
  return true
}

const tableSourceData = computed(() => {
  const seg = headerUsersFilterActive.value ? headerQuickSegment.value : 'all'
  let rows = data.value
  if (seg !== 'all') {
    rows = rows.filter((e) => employeeMatchesHeaderQuickSegment(e, seg))
  }
  rows = rows.filter((e) => employeeMatchesSubscriptionProductFilters(e))
  return rows
})

type EmployeeFacetKey = 'department' | 'position' | 'tags'

const FACET_COLUMN_IDS: readonly EmployeeFacetKey[] = [
  'department',
  'position',
  'tags',
] as const

const employeeFacetFilters = reactive<
  Record<EmployeeFacetKey, { filterActive: boolean; selected: string[] }>
>({
  department: { filterActive: false, selected: [] },
  position: { filterActive: false, selected: [] },
  tags: { filterActive: false, selected: [] },
})

const filtersPopoverOpen = ref(false)

const filtersPopoverBadgeCount = computed(() => {
  let n = 0
  if (headerUsersFilterActive.value) n += 1
  for (const key of FACET_COLUMN_IDS) {
    if (employeeFacetFilters[key].filterActive) n += 1
  }
  return n
})

const departmentFilterOptions = computed(() => {
  const s = new Set<string>()
  for (const e of data.value) {
    if (e.department) s.add(e.department)
  }
  return [...s].sort((a, b) => a.localeCompare(b, 'ru'))
})

const positionFilterOptions = computed(() => {
  const s = new Set<string>()
  for (const e of data.value) {
    if (e.position) s.add(e.position)
  }
  return [...s].sort((a, b) => a.localeCompare(b, 'ru'))
})

const tagsFilterOptions = computed(() => {
  const s = new Set<string>()
  for (const e of data.value) {
    const raw = e.tags.trim()
    if (!raw || raw === '—') {
      s.add('—')
      continue
    }
    for (const t of raw.split(/[,;]+/).map((x) => x.trim()).filter(Boolean)) {
      s.add(t)
    }
  }
  return [...s].sort((a, b) => a.localeCompare(b, 'ru'))
})

const filterFacetRows = computed(() =>
  [
    { id: 'position' as const, label: 'Должность', options: positionFilterOptions.value },
    { id: 'department' as const, label: 'Отдел', options: departmentFilterOptions.value },
    { id: 'tags' as const, label: 'Тег', options: tagsFilterOptions.value },
  ],
)

function facetTriggerSummary(key: EmployeeFacetKey): string {
  const sel = employeeFacetFilters[key].selected
  if (sel.length === 0) return 'Не выбрано'
  if (sel.length === 1) return sel[0]!
  return 'Свой выбор'
}

function onFacetFilterActiveToggle(key: EmployeeFacetKey, active: boolean) {
  employeeFacetFilters[key].filterActive = active
  syncEmployeeFacetFiltersToColumnFilters()
}

function onFacetOptionToggle(key: EmployeeFacetKey, option: string, checked: boolean) {
  const row = employeeFacetFilters[key]
  const arr = row.selected
  const has = arr.includes(option)
  if (checked && !has) {
    arr.push(option)
    row.filterActive = true
  }
  if (!checked && has) {
    const i = arr.indexOf(option)
    if (i >= 0) arr.splice(i, 1)
  }
}

function clearFacetSelection(key: EmployeeFacetKey) {
  employeeFacetFilters[key].filterActive = false
  employeeFacetFilters[key].selected = []
}

function onHeaderUsersFilterActiveToggle(active: boolean) {
  headerUsersFilterActive.value = active
  if (active && headerQuickSegment.value === 'all') {
    headerQuickSegment.value = HEADER_QUICK_SEGMENT_FILTER_OPTIONS[0]!.value
  }
  syncEmployeeFacetFiltersToColumnFilters()
}

function resetAllEmployeeFacets() {
  headerUsersFilterActive.value = false
  headerQuickSegment.value = 'all'
  for (const k of FACET_COLUMN_IDS) {
    employeeFacetFilters[k].filterActive = false
    employeeFacetFilters[k].selected = []
  }
}

function syncEmployeeFacetFiltersToColumnFilters() {
  const base = columnFilters.value.filter(
    (f) => !FACET_COLUMN_IDS.includes(f.id as EmployeeFacetKey),
  )
  const add: ColumnFiltersState = []
  for (const key of FACET_COLUMN_IDS) {
    const r = employeeFacetFilters[key]
    if (r.filterActive && r.selected.length > 0) {
      add.push({ id: key, value: [...r.selected] })
    }
  }
  const next = [...base, ...add]
  if (JSON.stringify(columnFilters.value) !== JSON.stringify(next)) {
    columnFilters.value = next
  }
}

function setHeaderQuickSegment(seg: HeaderQuickSegment) {
  const next = headerQuickSegment.value === seg ? 'all' : seg
  headerQuickSegment.value = next
  headerUsersFilterActive.value = next !== 'all'
  syncEmployeeFacetFiltersToColumnFilters()
}

function onHeaderQuickSegmentSelect(v: unknown) {
  const s = v == null || v === '' ? 'all' : (String(v) as HeaderQuickSegment)
  headerQuickSegment.value = s
  if (s !== 'all') headerUsersFilterActive.value = true
  syncEmployeeFacetFiltersToColumnFilters()
}

function clearHeaderQuickSegment() {
  headerUsersFilterActive.value = false
  headerQuickSegment.value = 'all'
  syncEmployeeFacetFiltersToColumnFilters()
}

watch(employeeFacetFilters, syncEmployeeFacetFiltersToColumnFilters, { deep: true })

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const

const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
})

watch(headerQuickSegment, () => {
  pagination.value = { ...pagination.value, pageIndex: 0 }
  nextTick(updateHeaderFilterScrollArrows)
})

watch(
  employeeSubscriptionProductFilters,
  () => {
    pagination.value = { ...pagination.value, pageIndex: 0 }
  },
  { deep: true },
)

watch(
  columnFilters,
  () => {
    pagination.value = { ...pagination.value, pageIndex: 0 }
  },
  { deep: true },
)

watchDebounced(
  globalFilterInput,
  (v: string) => {
    globalFilter.value = v ?? ''
  },
  { debounce: 300 },
)

const columns: ColumnDef<Employee>[] = [
  {
    id: 'select',
    header: () => null,
    cell: () => null,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
  },
  {
    accessorKey: 'fullName',
    filterFn: fuzzyColumnFilter,
    enableHiding: false,
    /** Видимая ячейка — в шаблоне (`fullName`), чтобы бейдж AD позиционировался от `td`. */
    cell: ({ row }) =>
      h('span', { class: 'sr-only' }, `${row.original.fullName}, ${row.original.email}`),
  },
  {
    accessorKey: 'department',
    filterFn: facetArrayIncludesFilter,
    cell: ({ getValue }) =>
      h(
        'span',
        { class: 'block max-w-[12rem] truncate text-foreground text-sm leading-tight' },
        String(getValue<string>()),
      ),
  },
  {
    accessorKey: 'position',
    filterFn: facetArrayIncludesFilter,
    cell: ({ getValue }) =>
      h(
        'span',
        { class: 'block max-w-[12rem] truncate text-foreground text-sm leading-tight' },
        String(getValue<string>()),
      ),
  },
  {
    accessorKey: 'tags',
    filterFn: facetTagsAnyMatchFilter,
    cell: ({ getValue }) => String(getValue<string>()),
  },
  {
    accessorKey: 'subscriptions',
    filterFn: cellStringIncludes,
    enableHiding: false,
    cell: () => null,
  },
  {
    id: 'actions',
    header: () => null,
    cell: () => null,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
  },
]

const route = useRoute()

function hasActiveFiltersState(
  globalFilterValue: string,
  columnFiltersValue: ColumnFiltersState,
): boolean {
  if (String(globalFilterValue ?? '').trim() !== '') return true
  for (const f of columnFiltersValue) {
    const v = f.value
    if (v === undefined || v === null) continue
    if (typeof v === 'string' && v.trim() === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    return true
  }
  return false
}

function pluralizeUsers(count: number): string {
  const nAbs = Math.abs(Math.trunc(count)) % 100
  const n1 = nAbs % 10
  if (nAbs > 10 && nAbs < 20) return 'пользователей'
  if (n1 === 1) return 'пользователь'
  if (n1 >= 2 && n1 <= 4) return 'пользователя'
  return 'пользователей'
}

const table = useVueTable({
  get data() {
    return tableSourceData.value
  },
  columns,
  getRowId: (row) => row.id,
  enableRowSelection: true,
  globalFilterFn: fuzzyGlobalFilter,
  state: {
    get sorting() {
      return sorting.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get globalFilter() {
      return globalFilter.value
    },
    get pagination() {
      return pagination.value
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater
  },
  onColumnFiltersChange: (updater) => {
    columnFilters.value = typeof updater === 'function' ? updater(columnFilters.value) : updater
  },
  onColumnVisibilityChange: (updater) => {
    columnVisibility.value = typeof updater === 'function' ? updater(columnVisibility.value) : updater
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  },
})

function onPageSizeSelect(value: unknown) {
  if (value == null || value === '') return
  const n = Number(value)
  if (!Number.isFinite(n) || !(PAGE_SIZE_OPTIONS as readonly number[]).includes(n)) return
  table.setPageSize(n)
}

const columnPickerLeafColumns = computed(() => {
  void columnVisibility.value
  return table.getAllLeafColumns().filter((c) => c.getCanHide())
})

function columnVisibilityLabel(columnId: string): string {
  return COLUMN_LABELS[columnId] ?? columnId
}

const visibleLeafColumnCount = computed(() => {
  void columnVisibility.value
  return table.getVisibleLeafColumns().length
})

const userListSummary = computed(() => {
  void globalFilter.value
  void columnFilters.value
  void sorting.value
  void data.value
  void rowSelection.value
  void headerQuickSegment.value
  void headerUsersFilterActive.value
  for (const p of SUBSCRIPTION_STACK_POOL) {
    void employeeSubscriptionProductFilters[p].filterActive
    void employeeSubscriptionProductFilters[p].requireHasSubscription
  }

  const total = data.value.length
  const filtered = table.getFilteredRowModel().rows.length
  const useFiltered =
    hasActiveFiltersState(globalFilter.value, columnFilters.value)
    || headerUsersFilterActive.value
    || FACET_COLUMN_IDS.some((k) => employeeFacetFilters[k].filterActive)
    || SUBSCRIPTION_STACK_POOL.some((p) => employeeSubscriptionProductFilters[p].filterActive)

  const n = useFiltered ? filtered : total

  return `${n} ${pluralizeUsers(n)}`
})

/** v-model: «выбрать всех на странице» для чекбокса в шапке таблицы. */
const pageSelectAllModel = computed({
  get(): boolean | 'indeterminate' {
    void rowSelection.value
    void pagination.value
    if (table.getIsAllPageRowsSelected()) return true
    if (table.getIsSomePageRowsSelected()) return 'indeterminate'
    return false
  },
  set(value: boolean | 'indeterminate') {
    const checked = value === true || value === 'indeterminate'
    table.toggleAllPageRowsSelected(checked)
  },
})

const selectedEmployeesCount = computed(() => {
  void rowSelection.value
  return table.getFilteredSelectedRowModel().rows.length
})

const showEmployeeBulkBar = computed(() => selectedEmployeesCount.value > 0)

function clearEmployeeRowSelection() {
  table.resetRowSelection()
}

const sheetEmployee = ref<Employee | null>(null)

function openEmployeeSheet(employee: Employee) {
  sheetEmployee.value = employee
}

function closeEmployeeSheet() {
  sheetEmployee.value = null
}

function onEmployeeSheetOpenChange(open: boolean) {
  if (!open) sheetEmployee.value = null
}

const ADD_USER_ROLE_OPTIONS = [
  { value: 'user', label: 'Пользователь' },
  { value: 'admin', label: 'Администратор' },
] as const

const addUserDialogOpen = ref(false)
/** Режим общей формы пользователя в диалоге. */
const userFormDialogMode = ref<'add' | 'edit'>('add')
const editingEmployeeId = ref<string | null>(null)

const addUserAvatarFileInput = ref<HTMLInputElement | null>(null)
const addUserAvatarObjectUrl = ref<string | null>(null)

const addUserForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  role: 'user' as (typeof ADD_USER_ROLE_OPTIONS)[number]['value'],
})

const addUserTagChips = ref<string[]>([])
const addUserTagInput = ref('')

const addUserPlanFilter = ref('')
const addUserSelectedPlanCodes = ref<string[]>([])

const addUserFilteredPlans = computed(() => {
  const q = addUserPlanFilter.value.trim().toLowerCase()
  return ADD_USER_PLAN_CATALOG.filter((row) => {
    if (!q) return true
    if (row.code.toLowerCase().includes(q)) return true
    return PRODUCT_SUBSCRIPTION_LABELS[row.chip].toLowerCase().includes(q)
  })
})

const addUserSelectedPlansOrdered = computed(() => {
  const rows = addUserSelectedPlanCodes.value
    .map((code) => ADD_USER_PLAN_CATALOG.find((r) => r.code === code))
    .filter((r): r is (typeof ADD_USER_PLAN_CATALOG)[number] => r != null)
  return [...rows].sort((a, b) => {
    const byProduct =
      (subscriptionProductOrder[a.chip] ?? 0) - (subscriptionProductOrder[b.chip] ?? 0)
    if (byProduct !== 0) return byProduct
    return (addUserPlanCatalogIndex[a.code] ?? 0) - (addUserPlanCatalogIndex[b.code] ?? 0)
  })
})

/** Одна иконка на продукт (по `icon`); дубликаты тарифов того же продукта уходят в +N. */
const addUserSelectedPlansUniqueByIcon = computed(() => {
  const seen = new Set<ProductIconKey>()
  const out: (typeof ADD_USER_PLAN_CATALOG)[number][] = []
  for (const row of addUserSelectedPlansOrdered.value) {
    if (seen.has(row.icon)) continue
    seen.add(row.icon)
    out.push(row)
  }
  return out
})

const MAX_ADD_USER_PLAN_PREVIEW = 5
const addUserSelectedPlansPreview = computed(() =>
  addUserSelectedPlansUniqueByIcon.value.slice(0, MAX_ADD_USER_PLAN_PREVIEW),
)
const addUserSelectedPlansOverflow = computed(() =>
  Math.max(0, addUserSelectedPlansOrdered.value.length - addUserSelectedPlansPreview.value.length),
)

const userFormDialogAvatarDisplayUrl = computed(() => {
  if (addUserAvatarObjectUrl.value) return addUserAvatarObjectUrl.value
  if (userFormDialogMode.value !== 'edit' || !editingEmployeeId.value) return null
  return data.value.find((e) => e.id === editingEmployeeId.value)?.avatarUrl ?? null
})

function parseTagsForChips(raw: string): string[] {
  const t = raw.trim()
  if (!t || t === '—') return []
  return t.split(',').map((s) => s.trim()).filter(Boolean)
}

function formatTagsForEmployee(chips: readonly string[]): string {
  return chips.length > 0 ? chips.join(', ') : '—'
}

function commitAddUserTagsFromInput() {
  const parts = addUserTagInput.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 0) return
  const set = new Set(addUserTagChips.value)
  for (const p of parts) set.add(p)
  addUserTagChips.value = [...set]
  addUserTagInput.value = ''
}

function commitAddUserTagsFromInputIfPending() {
  if (!addUserTagInput.value.trim()) return
  commitAddUserTagsFromInput()
}

function removeAddUserTagAt(index: number) {
  addUserTagChips.value = addUserTagChips.value.filter((_, i) => i !== index)
}

function onAddUserTagInputKeydown(e: KeyboardEvent) {
  const el = e.target as HTMLInputElement
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    commitAddUserTagsFromInput()
    return
  }
  if (e.key === 'Backspace' && el.value === '' && addUserTagChips.value.length > 0) {
    removeAddUserTagAt(addUserTagChips.value.length - 1)
  }
}

function toggleAddUserPlan(code: string, checked: boolean) {
  const cur = addUserSelectedPlanCodes.value
  if (checked) {
    if (cur.includes(code)) return
    addUserSelectedPlanCodes.value = [...cur, code]
  } else {
    addUserSelectedPlanCodes.value = cur.filter((c) => c !== code)
  }
}

function addUserAvatarInitials() {
  const a = addUserForm.firstName.trim().charAt(0)
  const b = addUserForm.lastName.trim().charAt(0)
  if (!a && !b) return '—'
  return `${a}${b}`.toUpperCase()
}

function resetAddUserFormFields() {
  addUserForm.firstName = ''
  addUserForm.lastName = ''
  addUserForm.email = ''
  addUserForm.phone = ''
  addUserForm.position = ''
  addUserForm.role = 'user'
  addUserTagChips.value = []
  addUserTagInput.value = ''
  addUserPlanFilter.value = ''
  addUserSelectedPlanCodes.value = []
}

function revokeAddUserAvatarPreview() {
  const u = addUserAvatarObjectUrl.value
  if (u?.startsWith('blob:')) URL.revokeObjectURL(u)
  addUserAvatarObjectUrl.value = null
}

function openAddUserDialog() {
  userFormDialogMode.value = 'add'
  editingEmployeeId.value = null
  resetAddUserFormFields()
  revokeAddUserAvatarPreview()
  addUserDialogOpen.value = true
}

function hydrateEditFormFromEmployee(e: Employee) {
  userFormDialogMode.value = 'edit'
  editingEmployeeId.value = e.id
  const parts = e.fullName.trim().split(/\s+/).filter(Boolean)
  addUserForm.firstName = parts[0] ?? ''
  addUserForm.lastName = parts.slice(1).join(' ') ?? ''
  addUserForm.email = e.email
  addUserForm.phone = e.phone
  addUserForm.position = e.position === '—' ? '' : e.position
  addUserTagChips.value = parseTagsForChips(e.tags)
  addUserTagInput.value = ''
  addUserForm.role = e.role === 'Администратор' ? 'admin' : 'user'
  addUserPlanFilter.value = ''
  addUserSelectedPlanCodes.value = inferPlanCodesFromEmployee(e)
  revokeAddUserAvatarPreview()
}

function openEditUserFromSheet() {
  const e = sheetEmployee.value
  if (!e) return
  hydrateEditFormFromEmployee(e)
  closeEmployeeSheet()
  addUserDialogOpen.value = true
}

function onAddUserAvatarFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  revokeAddUserAvatarPreview()
  addUserAvatarObjectUrl.value = URL.createObjectURL(file)
}

function clearAddUserAvatar() {
  revokeAddUserAvatarPreview()
}

function submitUserForm() {
  if (userFormDialogMode.value === 'add') {
    addUserDialogOpen.value = false
    return
  }
  const id = editingEmployeeId.value
  if (!id) {
    addUserDialogOpen.value = false
    return
  }
  const idx = data.value.findIndex((row) => row.id === id)
  if (idx === -1) {
    addUserDialogOpen.value = false
    return
  }
  const row = data.value[idx]!
  const fn = addUserForm.firstName.trim()
  const ln = addUserForm.lastName.trim()
  row.fullName = [fn, ln].filter(Boolean).join(' ') || row.fullName
  row.email = addUserForm.email.trim() || row.email
  row.phone = addUserForm.phone.trim() || row.phone
  row.position = addUserForm.position.trim() || '—'
  row.tags = formatTagsForEmployee(addUserTagChips.value)
  row.role = addUserForm.role === 'admin' ? 'Администратор' : 'Пользователь'
  const firstForGender =
    fn || row.fullName.trim().split(/\s+/).filter(Boolean)[0] || 'Иван'
  row.gender = demoGenderFromFirstName(firstForGender)
  if (addUserAvatarObjectUrl.value) {
    row.avatarUrl = addUserAvatarObjectUrl.value
  }
  const planCodes = [...addUserSelectedPlanCodes.value]
  row.subscriptionStack =
    planCodes.length > 0
      ? subscriptionStackFromSelectedPlanCodes(planCodes)
      : buildSubscriptionStack(row.id)
  row.subscriptions =
    planCodes.length > 0
      ? Math.max(6, planCodes.length * 2)
      : Math.max(
          6,
          row.subscriptionStack.reduce((s, it) => s + 1 + it.extraVariants, 0) + 1,
        )
  addUserDialogOpen.value = false
}

watch(addUserDialogOpen, (open) => {
  if (!open) {
    revokeAddUserAvatarPreview()
    userFormDialogMode.value = 'add'
    editingEmployeeId.value = null
    resetAddUserFormFields()
  }
})

/** Модалка «Подключить»: одна строка или массовый выбор (черновик → «Применить» на панели). */
const connectProductsDialogOpen = ref(false)
const connectProductsBulkMode = ref(false)
const connectProductsEmployeeId = ref<string | null>(null)
const connectProductsPlanFilter = ref('')
const connectProductsSelectedCodes = ref<string[]>([])
/** Коды, уже отмеченные при открытии модалки — не дублируем в лимите повторно. */
const connectProductsInitialSelectedCodes = ref<string[]>([])

type PlanCatalogRow = (typeof ADD_USER_PLAN_CATALOG)[number]

const connectProductsTargetUserCount = computed(() => {
  if (connectProductsBulkMode.value) {
    void rowSelection.value
    return table.getFilteredSelectedRowModel().rows.length
  }
  return connectProductsEmployee.value ? 1 : 0
})

function connectProductsUsersAddingForPlan(code: string): number {
  if (!connectProductsSelectedCodes.value.includes(code)) return 0
  if (connectProductsInitialSelectedCodes.value.includes(code)) return 0
  return connectProductsTargetUserCount.value
}

function connectProductsProjectedUsed(plan: PlanCatalogRow): number {
  return plan.connectionsUsed + connectProductsUsersAddingForPlan(plan.code)
}

function connectProductsWouldExceedLimit(plan: PlanCatalogRow): boolean {
  const add = connectProductsInitialSelectedCodes.value.includes(plan.code)
    ? 0
    : connectProductsTargetUserCount.value
  return plan.connectionsUsed + add > plan.connectionsLimit
}

function isConnectProductsPlanCheckboxDisabled(code: string): boolean {
  if (connectProductsSelectedCodes.value.includes(code)) return false
  const plan = ADD_USER_PLAN_CATALOG.find((r) => r.code === code)
  return plan ? connectProductsWouldExceedLimit(plan) : false
}

function notifyConnectProductsLimitExceeded(plan: PlanCatalogRow) {
  const n = connectProductsTargetUserCount.value
  const usersPhrase = n === 1 ? '1 пользователя' : `${n} пользователей`

  const similar = ADD_USER_PLAN_CATALOG.filter(
    (r) =>
      r.chip === plan.chip
      && r.code !== plan.code
      && r.connectionsUsed + n <= r.connectionsLimit,
  ).map((r) => r.code)

  const hint =
    similar.length > 0
      ? `Выберите, например: ${similar.slice(0, 3).join(', ')}.`
      : 'Расширьте тариф или выберите другую подписку похожего типа.'

  toast.error(`В «${plan.code}» нет свободных мест для ${usersPhrase}.`, { description: hint })
}

/** Черновик тарифов после «Сохранить» в массовой модалке подписок; применяется кнопкой панели «Применить». */
const bulkPendingPlanCodes = ref<string[]>([])

type BulkMassPlaceholderKind = 'department' | 'position' | 'tags'
const bulkMassPlaceholderOpen = ref(false)
const bulkMassPlaceholderKind = ref<BulkMassPlaceholderKind | null>(null)

const bulkMassPlaceholderTitle = computed(() => {
  switch (bulkMassPlaceholderKind.value) {
    case 'department':
      return 'Отдел'
    case 'position':
      return 'Должность'
    case 'tags':
      return 'Теги'
    default:
      return ''
  }
})

const bulkTagsChips = ref<string[]>([])
const bulkTagsInput = ref('')
const bulkDepartmentCustom = ref('')
const bulkDepartmentSelected = ref('')
const bulkPositionCustom = ref('')
const bulkPositionSelected = ref('')

const bulkCommonTags = computed(() =>
  tagsFilterOptions.value.filter((t) => t !== '—'),
)

const bulkDepartmentOptions = computed(() =>
  departmentFilterOptions.value.filter((d) => d !== '—'),
)

const bulkPositionOptions = computed(() =>
  positionFilterOptions.value.filter((p) => p !== '—'),
)

function resetBulkMassForm() {
  bulkTagsChips.value = []
  bulkTagsInput.value = ''
  bulkDepartmentCustom.value = ''
  bulkDepartmentSelected.value = ''
  bulkPositionCustom.value = ''
  bulkPositionSelected.value = ''
}

function commitBulkTagsFromInput() {
  const parts = bulkTagsInput.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 0) return
  const set = new Set(bulkTagsChips.value)
  for (const p of parts) set.add(p)
  bulkTagsChips.value = [...set]
  bulkTagsInput.value = ''
}

function commitBulkTagsFromInputIfPending() {
  if (!bulkTagsInput.value.trim()) return
  commitBulkTagsFromInput()
}

function removeBulkTagAt(index: number) {
  bulkTagsChips.value = bulkTagsChips.value.filter((_, i) => i !== index)
}

function onBulkTagsInputKeydown(e: KeyboardEvent) {
  const el = e.target as HTMLInputElement
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    commitBulkTagsFromInput()
    return
  }
  if (e.key === 'Backspace' && el.value === '' && bulkTagsChips.value.length > 0) {
    removeBulkTagAt(bulkTagsChips.value.length - 1)
  }
}

function toggleBulkCommonTag(tag: string) {
  const cur = bulkTagsChips.value
  if (cur.includes(tag)) {
    bulkTagsChips.value = cur.filter((t) => t !== tag)
  } else {
    bulkTagsChips.value = [...cur, tag]
  }
}

function resolveBulkSingleFieldValue(custom: string, selected: string): string {
  const c = custom.trim()
  if (c) return c
  return selected.trim()
}

function applyBulkMassToSelectedEmployees() {
  const kind = bulkMassPlaceholderKind.value
  if (!kind) return false

  const rows = table.getFilteredSelectedRowModel().rows
  if (rows.length === 0) return false

  if (kind === 'tags') {
    const toAdd = bulkTagsChips.value
    if (toAdd.length === 0) return false
    for (const r of rows) {
      const idx = data.value.findIndex((e) => e.id === r.original.id)
      if (idx === -1) continue
      const existing = parseTagsForChips(data.value[idx]!.tags)
      const merged = [...new Set([...existing, ...toAdd])]
      data.value[idx]!.tags = formatTagsForEmployee(merged)
    }
    return true
  }

  const value =
    kind === 'department'
      ? resolveBulkSingleFieldValue(bulkDepartmentCustom.value, bulkDepartmentSelected.value)
      : resolveBulkSingleFieldValue(bulkPositionCustom.value, bulkPositionSelected.value)

  if (!value) return false

  for (const r of rows) {
    const idx = data.value.findIndex((e) => e.id === r.original.id)
    if (idx === -1) continue
    if (kind === 'department') {
      data.value[idx]!.department = value
    } else {
      data.value[idx]!.position = value
    }
  }
  return true
}

function submitBulkMassDialog() {
  if (bulkMassPlaceholderKind.value === 'tags') {
    commitBulkTagsFromInputIfPending()
  }
  if (!applyBulkMassToSelectedEmployees()) return
  bulkMassPlaceholderOpen.value = false
}

const connectProductsEmployee = computed(() => {
  const id = connectProductsEmployeeId.value
  if (!id) return null
  return data.value.find((e) => e.id === id) ?? null
})

const connectProductsFilteredPlans = computed(() => {
  const q = connectProductsPlanFilter.value.trim().toLowerCase()
  return ADD_USER_PLAN_CATALOG.filter((row) => {
    if (!q) return true
    if (row.code.toLowerCase().includes(q)) return true
    return PRODUCT_SUBSCRIPTION_LABELS[row.chip].toLowerCase().includes(q)
  })
})

const connectProductsSelectAllModel = computed({
  get(): boolean | 'indeterminate' {
    void connectProductsSelectedCodes.value
    void connectProductsPlanFilter.value
    const rows = connectProductsFilteredPlans.value
    if (rows.length === 0) return false
    const selected = connectProductsSelectedCodes.value
    const picked = rows.filter((r) => selected.includes(r.code)).length
    if (picked === 0) return false
    if (picked === rows.length) return true
    return 'indeterminate'
  },
  set(value: boolean | 'indeterminate') {
    const codes = connectProductsFilteredPlans.value.map((r) => r.code)
    const on = value === true || value === 'indeterminate'
    if (on) {
      const set = new Set(connectProductsSelectedCodes.value)
      let skipped = 0
      for (const code of codes) {
        if (set.has(code)) continue
        const plan = ADD_USER_PLAN_CATALOG.find((r) => r.code === code)
        if (!plan) continue
        if (connectProductsWouldExceedLimit(plan)) {
          skipped += 1
          continue
        }
        set.add(code)
      }
      connectProductsSelectedCodes.value = [...set]
      if (skipped > 0) {
        toast.warning('Часть подписок не выбрана: нет свободных мест по лимиту подключений.')
      }
    } else {
      const drop = new Set(codes)
      connectProductsSelectedCodes.value = connectProductsSelectedCodes.value.filter(
        (c) => !drop.has(c),
      )
    }
  },
})

function applyPlanCodesToEmployeeRow(row: Employee, planCodes: string[]) {
  row.subscriptionStack =
    planCodes.length > 0
      ? subscriptionStackFromSelectedPlanCodes(planCodes)
      : buildSubscriptionStack(row.id)
  row.subscriptions =
    planCodes.length > 0
      ? Math.max(6, planCodes.length * 2)
      : Math.max(
          6,
          row.subscriptionStack.reduce((s, it) => s + 1 + it.extraVariants, 0) + 1,
        )
}

function applyPlanCodesToSelectedEmployees(planCodes: string[]) {
  for (const r of table.getFilteredSelectedRowModel().rows) {
    const idx = data.value.findIndex((row) => row.id === r.original.id)
    if (idx === -1) continue
    applyPlanCodesToEmployeeRow(data.value[idx]!, planCodes)
  }
}

function snapshotConnectProductsInitialSelection() {
  connectProductsInitialSelectedCodes.value = [...connectProductsSelectedCodes.value]
}

function toggleConnectProductsPlan(code: string, checked: boolean) {
  const plan = ADD_USER_PLAN_CATALOG.find((r) => r.code === code)
  if (!plan) return
  const cur = connectProductsSelectedCodes.value
  if (checked) {
    if (cur.includes(code)) return
    if (connectProductsWouldExceedLimit(plan)) {
      notifyConnectProductsLimitExceeded(plan)
      return
    }
    connectProductsSelectedCodes.value = [...cur, code]
  } else {
    connectProductsSelectedCodes.value = cur.filter((c) => c !== code)
  }
}

function openConnectProductsDialog(employee: Employee) {
  connectProductsBulkMode.value = false
  connectProductsEmployeeId.value = employee.id
  connectProductsPlanFilter.value = ''
  connectProductsSelectedCodes.value = [...inferPlanCodesFromEmployee(employee)]
  snapshotConnectProductsInitialSelection()
  connectProductsDialogOpen.value = true
}

function openConnectProductsDialogBulk() {
  if (selectedEmployeesCount.value === 0) return
  connectProductsBulkMode.value = true
  connectProductsEmployeeId.value = null
  connectProductsPlanFilter.value = ''
  connectProductsSelectedCodes.value = [...bulkPendingPlanCodes.value]
  snapshotConnectProductsInitialSelection()
  connectProductsDialogOpen.value = true
}

function applyAllBulkChangesAndDismiss() {
  if (bulkPendingPlanCodes.value.length > 0) {
    applyPlanCodesToSelectedEmployees([...bulkPendingPlanCodes.value])
  }
  bulkPendingPlanCodes.value = []
  clearEmployeeRowSelection()
}

function submitConnectProductsDialog() {
  const planCodes = [...connectProductsSelectedCodes.value]

  if (connectProductsBulkMode.value) {
    bulkPendingPlanCodes.value = planCodes
    connectProductsDialogOpen.value = false
    connectProductsBulkMode.value = false
    connectProductsEmployeeId.value = null
    return
  }

  const id = connectProductsEmployeeId.value
  if (!id) {
    connectProductsDialogOpen.value = false
    return
  }
  const idx = data.value.findIndex((row) => row.id === id)
  if (idx === -1) {
    connectProductsDialogOpen.value = false
    connectProductsEmployeeId.value = null
    return
  }
  applyPlanCodesToEmployeeRow(data.value[idx]!, planCodes)
  connectProductsDialogOpen.value = false
  connectProductsEmployeeId.value = null
}

function openBulkMassPlaceholderDialog(kind: BulkMassPlaceholderKind) {
  if (selectedEmployeesCount.value === 0) return
  resetBulkMassForm()
  bulkMassPlaceholderKind.value = kind
  bulkMassPlaceholderOpen.value = true
}

function openConnectProductsDialogFromSheet() {
  const e = sheetEmployee.value
  if (!e) return
  closeEmployeeSheet()
  openConnectProductsDialog(e)
}

watch(connectProductsDialogOpen, (open) => {
  if (!open) {
    connectProductsEmployeeId.value = null
    connectProductsBulkMode.value = false
    connectProductsPlanFilter.value = ''
    connectProductsSelectedCodes.value = []
    connectProductsInitialSelectedCodes.value = []
  }
})

watch(showEmployeeBulkBar, (show) => {
  if (!show) {
    bulkPendingPlanCodes.value = []
  }
})

watch(bulkMassPlaceholderOpen, (open) => {
  if (!open) {
    bulkMassPlaceholderKind.value = null
    resetBulkMassForm()
  }
})
</script>

<template>
  <main class="container mx-auto flex min-h-0 flex-1 flex-col gap-4 px-6 py-6">
    <header class="flex flex-col gap-4">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <h1 class="text-2xl font-semibold tracking-tight text-foreground">
            Управление пользователями
          </h1>
          <p class="text-muted-foreground text-sm leading-relaxed">
            Список сотрудников организации: ручное создание и импорт CSV, привязка к отделам, назначение ролей, тегов и подписок, настройка прав доступа.
            В таблице доступны поиск, фильтры и выбор отображаемых колонок.
          </p>
        </div>
        <Button type="button" variant="blue" class="h-9 w-fit shrink-0 gap-2 self-start sm:self-auto">
          Улучшить тариф
          <TrendingUp class="size-4 shrink-0" aria-hidden="true" />
        </Button>
      </div>

      <div
        class="flex min-w-0 w-full items-stretch"
        role="toolbar"
        aria-label="Быстрые фильтры списка пользователей"
      >
        <div
          class="group/header-filter-toolbar relative min-h-[62px] min-w-0 w-full flex-1"
        >
          <div
            ref="headerFilterScrollEl"
            class="min-h-[62px] min-w-0 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-none"
            @scroll.passive="updateHeaderFilterScrollArrows"
          >
            <div class="inline-flex min-h-[62px] flex-nowrap items-center gap-4 py-1">
            <button
              type="button"
              :class="cn(
                'inline-flex shrink-0 items-center gap-4 rounded-xl border bg-background px-4 py-3 text-left outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                headerQuickSegment === 'all' ? 'border border-primary' : 'border border-border hover:border-primary',
              )"
              :aria-pressed="headerQuickSegment === 'all'"
              @click="setHeaderQuickSegment('all')"
            >
              <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-500 text-white">
                <Users class="size-6 shrink-0" aria-hidden="true" />
              </span>
              <span class="text-foreground text-sm leading-snug">Все пользователи</span>
              <span class="text-foreground text-base font-bold tabular-nums">{{ headerSegmentCounts.all }}</span>
            </button>

            <button
              type="button"
              :class="cn(
                'inline-flex shrink-0 items-center gap-4 rounded-xl border bg-background px-4 py-3 text-left outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                headerQuickSegment === 'accepted' ? 'border border-primary' : 'border border-border hover:border-primary',
              )"
              :aria-pressed="headerQuickSegment === 'accepted'"
              @click="setHeaderQuickSegment('accepted')"
            >
              <span class="bg-primary flex size-9 shrink-0 items-center justify-center rounded-lg text-primary-foreground">
                <ListTodo class="size-6 shrink-0" aria-hidden="true" />
              </span>
              <span class="text-foreground text-sm leading-snug">Принятые приглашения</span>
              <span class="text-foreground text-base font-bold tabular-nums">{{ headerSegmentCounts.accepted }}</span>
            </button>

            <button
              type="button"
              :class="cn(
                'inline-flex shrink-0 items-center gap-4 rounded-xl border bg-background px-4 py-3 text-left outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                headerQuickSegment === 'pending' ? 'border border-primary' : 'border border-border hover:border-primary',
              )"
              :aria-pressed="headerQuickSegment === 'pending'"
              @click="setHeaderQuickSegment('pending')"
            >
              <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
                <ListX class="size-6 shrink-0" aria-hidden="true" />
              </span>
              <span class="text-foreground text-sm leading-snug">Не принятые приглашения</span>
              <span class="text-foreground text-base font-bold tabular-nums">{{ headerSegmentCounts.pending }}</span>
            </button>

            <button
              type="button"
              :class="cn(
                'inline-flex shrink-0 items-center gap-4 rounded-xl border bg-background px-4 py-3 text-left outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                headerQuickSegment === 'ad' ? 'border border-primary' : 'border border-border hover:border-primary',
              )"
              :aria-pressed="headerQuickSegment === 'ad'"
              @click="setHeaderQuickSegment('ad')"
            >
              <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-base font-medium text-white">
                AD
              </span>
              <span class="text-foreground text-sm leading-snug">Интеграции (AD, SSO, API)</span>
              <span class="text-foreground text-base font-bold tabular-nums">{{ headerSegmentCounts.ad }}</span>
            </button>

            <button
              type="button"
              :class="cn(
                'inline-flex shrink-0 items-center gap-4 rounded-xl border bg-background px-4 py-3 text-left outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                headerQuickSegment === 'no_subscriptions' ? 'border border-primary' : 'border border-border hover:border-primary',
              )"
              :aria-pressed="headerQuickSegment === 'no_subscriptions'"
              @click="setHeaderQuickSegment('no_subscriptions')"
            >
              <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white">
                <PackageX class="size-6 shrink-0" aria-hidden="true" />
              </span>
              <span class="text-foreground text-sm leading-snug">Без подписок</span>
              <span class="text-foreground text-base font-bold tabular-nums">{{ headerSegmentCounts.noSubscriptions }}</span>
            </button>
            </div>
          </div>

          <div
            v-if="headerFilterScrollArrows.showLeft"
            class="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-14 items-center justify-start bg-gradient-to-r from-muted/95 via-muted/50 to-transparent pl-0.5 backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover/header-filter-toolbar:opacity-100 group-focus-within/header-filter-toolbar:opacity-100"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              class="pointer-events-auto size-9 shrink-0 border-border bg-white text-foreground shadow-sm hover:bg-neutral-50 dark:bg-card dark:hover:bg-muted/80"
              aria-label="Прокрутить фильтры в начало"
              @click.stop="scrollHeaderFilters('start')"
            >
              <ChevronLeft class="size-4 shrink-0" aria-hidden="true" />
            </Button>
          </div>
          <div
            v-if="headerFilterScrollArrows.showRight"
            class="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-14 items-center justify-end bg-gradient-to-l from-muted/95 via-muted/50 to-transparent pr-0.5 backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover/header-filter-toolbar:opacity-100 group-focus-within/header-filter-toolbar:opacity-100"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              class="pointer-events-auto size-9 shrink-0 border-border bg-white text-foreground shadow-sm hover:bg-neutral-50 dark:bg-card dark:hover:bg-muted/80"
              aria-label="Прокрутить фильтры в конец"
              @click.stop="scrollHeaderFilters('end')"
            >
              <ChevronRight class="size-4 shrink-0" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </header>

    <div
      class="relative flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-background p-4"
    >
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="showEmployeeBulkBar"
          key="employee-bulk-bar"
          class="absolute top-4 inset-x-4 z-30 flex min-h-10 flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-800 px-3 py-2 text-white shadow-sm dark:bg-slate-900"
          role="toolbar"
          :aria-label="`Панель массовых действий. Выбрано сотрудников: ${selectedEmployeesCount}. Изменения по кнопкам применяются ко всем отмеченным строкам: подписки, отдел, должность, теги.`"
        >
          <div class="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-9 shrink-0 text-white hover:bg-white/10 hover:text-white"
              aria-label="Закрыть"
              @click="clearEmployeeRowSelection"
            >
              <X class="size-4 shrink-0 opacity-90" aria-hidden="true" />
            </Button>
            <div
              class="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1 text-base leading-snug text-white"
            >
              <span class="font-normal">Выбрано</span>
              <span class="font-medium tabular-nums">{{ selectedEmployeesCount }}</span>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    type="button"
                    variant="ghost"
                    class="ml-0.5 h-7 shrink-0 gap-1 rounded-full border-0 bg-white/10 px-2 text-xs font-normal text-white shadow-none ring-0 hover:bg-white/20 hover:text-white"
                    aria-label="Справка: для чего эта панель"
                  >
                    <CircleHelp class="size-3.5 shrink-0 opacity-95" aria-hidden="true" />
                    Справка
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  class="max-w-xs border border-border p-3 text-sm leading-snug text-foreground shadow-md"
                >
                  <p class="font-medium text-foreground">Массовые действия</p>
                  <p class="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                    Панель нужна, чтобы массово назначать выбранным сотрудникам подписки, отдел, должность и теги,
                    не открывая карточку каждого пользователя.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div class="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 text-white sm:flex-initial">
              <Button
                type="button"
                variant="ghost"
                class="relative h-9 shrink-0 gap-1.5 rounded-md px-2.5 text-sm font-normal text-white hover:bg-white/10 hover:text-white sm:px-3"
                aria-label="Добавить подписки выбранным пользователям"
                @click="openConnectProductsDialogBulk"
              >
                <Plus class="size-4 shrink-0 opacity-90" aria-hidden="true" />
                Добавить подписки
                <span
                  v-if="bulkPendingPlanCodes.length > 0"
                  class="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground shadow-sm tabular-nums"
                  aria-hidden="true"
                >
                  {{ bulkPendingPlanCodes.length }}
                </span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                class="h-9 shrink-0 gap-1.5 rounded-md px-2.5 text-sm font-normal text-white hover:bg-white/10 hover:text-white sm:px-3"
                aria-label="Добавить отдел выбранным пользователям"
                @click="openBulkMassPlaceholderDialog('department')"
              >
                <Plus class="size-4 shrink-0 opacity-90" aria-hidden="true" />
                Добавить отдел
              </Button>
              <Button
                type="button"
                variant="ghost"
                class="h-9 shrink-0 gap-1.5 rounded-md px-2.5 text-sm font-normal text-white hover:bg-white/10 hover:text-white sm:px-3"
                aria-label="Добавить должность выбранным пользователям"
                @click="openBulkMassPlaceholderDialog('position')"
              >
                <Plus class="size-4 shrink-0 opacity-90" aria-hidden="true" />
                Добавить должность
              </Button>
              <Button
                type="button"
                variant="ghost"
                class="h-9 shrink-0 gap-1.5 rounded-md px-2.5 text-sm font-normal text-white hover:bg-white/10 hover:text-white sm:px-3"
                aria-label="Добавить теги выбранным пользователям"
                @click="openBulkMassPlaceholderDialog('tags')"
              >
                <Plus class="size-4 shrink-0 opacity-90" aria-hidden="true" />
                Добавить теги
              </Button>
              <Button
                v-if="bulkPendingPlanCodes.length > 0"
                type="button"
                variant="default"
                class="h-9 shrink-0 px-3 shadow-sm"
                @click="applyAllBulkChangesAndDismiss"
              >
                Применить
              </Button>
          </div>
        </div>
      </Transition>

      <div class="flex min-w-0 flex-col gap-4">
        <nav
          class="relative flex items-end gap-2 border-b border-border"
          aria-label="Подраздел пользователей"
        >
          <NuxtLink
            :to="USERS_ROUTES.employees"
            class="inline-flex w-fit shrink-0 flex-col items-stretch gap-1 outline-none"
          >
            <span
              :class="cn(
                'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors',
                route.path === USERS_ROUTES.employees
                  ? 'bg-muted text-foreground'
                  : 'text-foreground hover:bg-muted/60',
              )"
            >
              Сотрудники
            </span>
            <span
              aria-hidden="true"
              class="relative z-10 -mb-px h-0.5 shrink-0 rounded-full transition-colors"
              :class="route.path === USERS_ROUTES.employees ? 'bg-primary' : 'bg-transparent'"
            />
          </NuxtLink>
          <NuxtLink
            :to="USERS_ROUTES.products"
            class="inline-flex w-fit shrink-0 flex-col items-stretch gap-1 outline-none"
          >
            <span
              :class="cn(
                'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors',
                route.path === USERS_ROUTES.products
                  ? 'bg-muted text-foreground'
                  : 'text-foreground hover:bg-muted/60',
              )"
            >
              Управление подписками
            </span>
            <span
              aria-hidden="true"
              class="relative z-10 -mb-px h-0.5 shrink-0 rounded-full transition-colors"
              :class="route.path === USERS_ROUTES.products ? 'bg-primary' : 'bg-transparent'"
            />
          </NuxtLink>
        </nav>

        <h2 class="text-lg font-semibold leading-none text-foreground">
          Список пользователей
        </h2>

        <div
          class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
        >
          <div
            class="flex min-w-0 w-full flex-row flex-nowrap items-center gap-2 overflow-x-auto sm:w-auto sm:max-w-full sm:overflow-visible sm:pr-2"
          >
            <Input
              v-model="globalFilterInput"
              type="search"
              variant="secondary"
              placeholder="Имя, фамилия или email"
              class="w-[min(100%,14rem)] shrink-0 sm:w-60 placeholder:text-sm"
              :icon-left="Search"
            />
            <div class="inline-flex shrink-0 items-center gap-2">
              <Popover v-model:open="filtersPopoverOpen">
                <PopoverTrigger as-child>
                  <Button
                    type="button"
                    variant="secondary"
                    class="h-9 shrink-0 gap-1.5 px-2.5"
                    aria-haspopup="dialog"
                  >
                    <ListFilter class="size-4 shrink-0" />
                    Фильтры
                    <span
                      v-if="filtersPopoverBadgeCount > 0"
                      class="inline-flex min-w-5 items-center justify-center rounded-full border border-border bg-white px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground"
                    >{{ filtersPopoverBadgeCount }}</span>
                    <ChevronDown class="size-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  class="w-[min(calc(100vw-2rem),20rem)] border border-border p-3 shadow-md"
                  :side-offset="8"
                >
                  <p class="text-muted-foreground mb-1.5 text-[11px] leading-snug">
                    Чекбокс включает фильтр; в списке — уточнение.
                  </p>
                  <div class="flex flex-col gap-1.5">
                    <div class="flex w-full min-w-0 items-center gap-2">
                      <div class="flex min-w-0 flex-1 items-center gap-2">
                        <Checkbox
                          :model-value="headerUsersFilterActive"
                          aria-label="Фильтр по сегменту пользователей"
                          @update:model-value="(v) => onHeaderUsersFilterActiveToggle(!!v)"
                        />
                        <span class="text-foreground truncate text-xs">Пользователи</span>
                      </div>
                      <div class="flex w-44 shrink-0 items-center gap-1">
                        <Select
                          :model-value="headerQuickSegment === 'all' ? undefined : headerQuickSegment"
                          @update:model-value="onHeaderQuickSegmentSelect"
                        >
                          <SelectTrigger
                            :disabled="!headerUsersFilterActive"
                            class="h-9 min-w-0 w-full max-w-full flex-1 shrink-0 justify-between gap-2 rounded-lg border-border px-2.5 text-xs font-normal"
                            aria-label="Сегмент списка пользователей"
                          >
                            <SelectValue placeholder="Не выбрано" />
                          </SelectTrigger>
                          <SelectContent align="end" class="border border-border">
                            <SelectGroup>
                              <SelectItem
                                v-for="opt in HEADER_QUICK_SEGMENT_FILTER_OPTIONS"
                                :key="opt.value"
                                :value="opt.value"
                              >
                                {{ opt.label }}
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <button
                          v-if="headerUsersFilterActive"
                          type="button"
                          class="text-muted-foreground hover:text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background outline-none"
                          aria-label="Сбросить сегмент пользователей"
                          @click="clearHeaderQuickSegment"
                        >
                          <X class="size-4 shrink-0" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div
                      v-for="facet in filterFacetRows"
                      :key="facet.id"
                      class="flex w-full min-w-0 items-center gap-2"
                    >
                      <div class="flex min-w-0 flex-1 items-center gap-2">
                        <Checkbox
                          :model-value="employeeFacetFilters[facet.id].filterActive"
                          :aria-label="`Фильтр: ${facet.label}`"
                          @update:model-value="(v) => onFacetFilterActiveToggle(facet.id, !!v)"
                        />
                        <span class="text-foreground truncate text-xs">{{ facet.label }}</span>
                      </div>
                      <div class="flex w-44 shrink-0 items-center gap-1">
                        <Popover>
                          <PopoverTrigger as-child>
                            <Button
                              type="button"
                              variant="outline"
                              :disabled="!employeeFacetFilters[facet.id].filterActive"
                              class="h-9 min-w-0 w-full max-w-full flex-1 shrink-0 justify-between gap-2 rounded-lg border-border bg-transparent px-2.5 text-xs font-normal disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span
                                class="min-w-0 flex-1 truncate text-left text-xs"
                                :class="
                                  employeeFacetFilters[facet.id].selected.length === 0
                                    ? 'text-muted-foreground'
                                    : 'text-foreground'
                                "
                              >{{
                                facetTriggerSummary(facet.id)
                              }}</span>
                              <span class="flex shrink-0 items-center gap-1">
                                <span
                                  v-if="employeeFacetFilters[facet.id].selected.length > 1"
                                  class="inline-flex min-w-5 items-center justify-center rounded-full border border-border px-1 py-0.5 text-xs font-medium tabular-nums text-foreground"
                                >{{ employeeFacetFilters[facet.id].selected.length }}</span>
                                <ChevronDown class="size-4 shrink-0 opacity-50" aria-hidden="true" />
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            class="w-[min(12rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] border border-border p-2 shadow-md"
                            :side-offset="4"
                          >
                            <div class="max-h-60 overflow-y-auto overflow-x-hidden">
                              <div class="flex flex-col gap-0.5 pr-2">
                                <label
                                  v-for="opt in facet.options"
                                  :key="`${facet.id}-${opt}`"
                                  class="flex cursor-pointer items-center gap-3 rounded-sm p-2 text-sm text-foreground hover:bg-muted"
                                >
                                  <Checkbox
                                    :model-value="employeeFacetFilters[facet.id].selected.includes(opt)"
                                    @update:model-value="(v) => onFacetOptionToggle(facet.id, opt, !!v)"
                                  />
                                  <span class="min-w-0 flex-1 leading-snug">{{ opt }}</span>
                                </label>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <button
                          v-if="employeeFacetFilters[facet.id].filterActive"
                          type="button"
                          class="text-muted-foreground hover:text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background outline-none"
                          :aria-label="`Сбросить ${facet.label}`"
                          @click="clearFacetSelection(facet.id)"
                        >
                          <X class="size-4 shrink-0" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="mt-2 flex justify-end border-t border-border pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      @click="resetAllEmployeeFacets"
                    >
                      Сбросить
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover v-model:open="subscriptionsFilterPopoverOpen">
                <PopoverTrigger as-child>
                  <Button
                    type="button"
                    variant="secondary"
                    class="h-9 shrink-0 gap-1.5 px-2.5"
                    aria-haspopup="dialog"
                  >
                    <Layers class="size-4 shrink-0" aria-hidden="true" />
                    Подписки
                    <span
                      v-if="subscriptionFiltersBadgeCount > 0"
                      class="inline-flex min-w-5 items-center justify-center rounded-full border border-border bg-white px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground"
                    >{{ subscriptionFiltersBadgeCount }}</span>
                    <ChevronDown class="size-4 shrink-0" aria-hidden="true" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  class="flex max-h-[min(70vh,26rem)] w-[min(calc(100vw-2rem),20rem)] flex-col overflow-hidden border border-border p-3 shadow-md"
                  :side-offset="8"
                >
                  <p class="text-muted-foreground mb-2 shrink-0 text-[11px] leading-snug">
                    Нет — без подписки, есть — с подпиской (любой тариф). Чекбокс включает фильтр.
                  </p>
                  <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
                    <div class="flex flex-col gap-1.5 pr-0.5">
                      <div
                        v-for="row in subscriptionFilterPopoverRows"
                        :key="row.product"
                        class="flex items-center justify-between gap-2 py-1.5"
                      >
                        <div class="flex min-w-0 flex-1 items-center gap-2">
                          <Checkbox
                            :model-value="employeeSubscriptionProductFilters[row.product].filterActive"
                            @update:model-value="(v) => { employeeSubscriptionProductFilters[row.product].filterActive = !!v }"
                          />
                          <span
                            class="flex size-8 shrink-0 items-center justify-center rounded-md text-white"
                            :class="subscriptionProductChipClass[row.product]"
                          >
                            <img
                              :src="productIconUrls[row.iconKey]"
                              :alt="''"
                              class="size-7 object-contain select-none"
                              loading="lazy"
                              decoding="async"
                              draggable="false"
                            />
                          </span>
                          <span class="text-foreground min-w-0 text-xs font-medium leading-tight">{{ row.label }}</span>
                        </div>
                        <div class="flex shrink-0 items-center gap-1.5">
                          <span class="text-muted-foreground hidden text-[10px] leading-none sm:inline">{{
                            employeeSubscriptionProductFilters[row.product].requireHasSubscription
                              ? 'Есть'
                              : 'Нет'
                          }}</span>
                          <Switch
                            v-model="employeeSubscriptionProductFilters[row.product].requireHasSubscription"
                            :disabled="!employeeSubscriptionProductFilters[row.product].filterActive"
                            :aria-label="`${row.label}: ${employeeSubscriptionProductFilters[row.product].requireHasSubscription ? 'с подпиской' : 'без подписки'}`"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mt-2 flex shrink-0 justify-end border-t border-border pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      @click="resetSubscriptionProductFilters"
                    >
                      Сбросить
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    type="button"
                    variant="secondary"
                    class="h-9 shrink-0 gap-1.5 px-2.5"
                    aria-haspopup="dialog"
                  >
                    Колонки
                    <ChevronDown class="size-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" class="w-56 border border-border p-2">
                  <p class="text-muted-foreground mb-2 px-2 text-xs font-medium">
                    Отображаемые колонки
                  </p>
                  <div class="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
                    <label
                      v-for="column in columnPickerLeafColumns"
                      :key="column.id"
                      class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted"
                    >
                      <Checkbox
                        :model-value="column.getIsVisible()"
                        @update:model-value="(v) => column.toggleVisibility(!!v)"
                      />
                      <span class="min-w-0 flex-1 leading-snug">{{ columnVisibilityLabel(column.id) }}</span>
                    </label>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div class="inline-flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:justify-end">
            <Button type="button" class="h-9 gap-2 px-3" @click="openAddUserDialog">
              <Plus class="size-5" />
              Добавить вручную
            </Button>
            <Button type="button" variant="outline" class="h-9 gap-2 bg-background px-3">
              <FileUp class="size-5" />
              Загрузить CSV файл
            </Button>
          </div>
        </div>

        <div class="min-w-0 rounded-none">
          <Table class="table-auto min-w-0">
            <TableHeader>
              <template
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
              >
                <TableRow class="border-border border-b hover:bg-transparent">
                  <TableHead
                    v-for="header in headerGroup.headers"
                    :key="header.id"
                    :class="cn(
                      'h-9 border-border border-r px-4 py-2 text-left align-middle text-xs font-normal text-muted-foreground last:border-r-0',
                      header.column.id === 'select'
                        ? 'w-11 min-w-11 px-4 text-center has-[[role=checkbox]]:pr-4'
                        : 'has-[[role=checkbox]]:pr-0',
                      header.column.id === 'fullName' && 'min-w-0',
                      header.column.id === 'subscriptions' &&
                        'min-w-0 max-w-44 overflow-hidden',
                      isEmployeeTableEqualWidthColumn(header.column.id) &&
                        'min-w-0 max-w-52 overflow-hidden',
                      header.column.id === 'tags' && 'min-w-0 w-36 max-w-36 overflow-hidden',
                      isNarrowColumn(header.column.id) && 'whitespace-nowrap text-center',
                      header.column.id === 'actions' &&
                        'w-auto min-w-min max-w-none shrink-0 px-2',
                    )"
                  >
                    <template v-if="header.column.id === 'select'">
                      <Checkbox
                        v-model="pageSelectAllModel"
                        aria-label="Выбрать всех на странице"
                      />
                    </template>
                    <template v-else-if="header.column.id === 'actions'">
                      <span class="text-xs font-normal text-muted-foreground" aria-hidden="true">
                        {{ COLUMN_LABELS.actions }}
                      </span>
                      <span class="sr-only">Изменить данные пользователя</span>
                    </template>
                    <template v-else-if="header.column.getCanSort()">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        :class="cn(
                          '-ml-2 h-8 gap-1 rounded-md px-2 text-xs font-normal text-muted-foreground hover:text-foreground',
                          isNarrowColumn(header.column.id) && 'mx-auto ml-0',
                        )"
                        @click="header.column.getToggleSortingHandler()?.($event)"
                      >
                        {{ COLUMN_LABELS[header.column.id] ?? header.column.id }}
                        <ArrowUp
                          v-if="header.column.getIsSorted() === 'asc'"
                          class="size-3.5 shrink-0 opacity-80"
                        />
                        <ArrowDown
                          v-else-if="header.column.getIsSorted() === 'desc'"
                          class="size-3.5 shrink-0 opacity-80"
                        />
                        <ArrowUpDown
                          v-else
                          class="size-3.5 shrink-0 opacity-70"
                        />
                      </Button>
                    </template>
                  </TableHead>
                </TableRow>
              </template>
            </TableHeader>
            <TableBody>
              <template v-if="table.getRowModel().rows.length">
                <TableRow
                  v-for="row in table.getRowModel().rows"
                  :key="row.id"
                  class="border-border border-b hover:bg-muted/40"
                >
                  <TableCell
                    v-for="cell in row.getVisibleCells()"
                    :key="cell.id"
                    :class="cn(
                      'border-border h-16 max-h-16 overflow-hidden border-r border-t px-3 py-2 align-middle last:border-r-0',
                      cell.column.id === 'select'
                        ? 'w-11 min-w-11 px-2 py-0 text-center has-[[role=checkbox]]:pr-2'
                        : 'has-[[role=checkbox]]:pr-0',
                      cell.column.id === 'fullName' && 'relative min-w-0',
                      cell.column.id === 'subscriptions' &&
                        'min-w-0 max-w-44 overflow-hidden',
                      isEmployeeTableEqualWidthColumn(cell.column.id) &&
                        'min-w-0 max-w-52 overflow-hidden',
                      cell.column.id === 'tags' && 'min-w-0 w-36 max-w-36 overflow-hidden',
                      isNarrowColumn(cell.column.id) && 'whitespace-nowrap text-center',
                      cell.column.id === 'actions' &&
                        'w-auto min-w-min max-w-none shrink-0 px-2',
                    )"
                  >
                    <template v-if="cell.column.id === 'select'">
                      <Checkbox
                        :model-value="row.getIsSelected()"
                        aria-label="Выбрать строку"
                        @update:model-value="(v) => row.toggleSelected(!!v)"
                      />
                    </template>
                    <template v-else-if="cell.column.id === 'actions'">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        class="group relative mx-auto text-muted-foreground hover:text-foreground"
                        aria-label="Изменить"
                        @click="openEmployeeSheet(row.original)"
                      >
                        <MoreVertical
                          class="size-4 shrink-0 transition-opacity duration-150 group-hover:opacity-0"
                          aria-hidden="true"
                        />
                        <Pencil
                          class="pointer-events-none absolute inset-0 m-auto size-4 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </Button>
                    </template>
                    <template v-else-if="cell.column.id === 'fullName'">
                      <div
                        class="flex min-w-0 items-center gap-2"
                        :class="row.original.adSync && 'pr-7'"
                      >
                        <Avatar class="size-9 shrink-0 border border-border">
                          <AvatarImage
                            :src="row.original.avatarUrl"
                            :alt="row.original.fullName"
                            loading="lazy"
                          />
                          <AvatarFallback class="text-[10px] font-medium text-muted-foreground">
                            {{ initialsFromFullName(row.original.fullName) }}
                          </AvatarFallback>
                        </Avatar>
                        <div class="flex min-w-0 flex-col gap-0.5">
                          <div class="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span class="font-semibold text-foreground text-sm leading-tight">
                              {{ row.original.fullName }}
                            </span>
                            <span
                              v-if="row.original.role === 'Администратор'"
                              class="inline-flex shrink-0 items-center rounded bg-primary px-1 py-px text-[10px] font-medium leading-none text-primary-foreground"
                            >
                              админ
                            </span>
                          </div>
                          <span class="text-muted-foreground text-xs leading-tight">
                            {{ row.original.email }}
                          </span>
                        </div>
                      </div>
                      <Tooltip v-if="row.original.adSync">
                        <TooltipTrigger as-child>
                          <div
                            class="absolute top-0 right-0 z-1 flex h-[18px] cursor-default items-center rounded-bl bg-blue-50 px-1 text-[9px] font-medium text-blue-500"
                          >
                            AD
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          LDAP / AD
                        </TooltipContent>
                      </Tooltip>
                    </template>
                    <template v-else-if="cell.column.id === 'subscriptions'">
                      <div
                        class="mx-auto w-fit max-w-full"
                        role="group"
                        :aria-label="
                          employeeNoSubscriptions(row.original)
                            ? 'Подписки не подключены. Доступно подключить продукты.'
                            : `Подписок: ${row.original.subscriptions}. Продуктов в стопке: ${row.original.subscriptionStack.length}.`
                        "
                      >
                        <template v-if="employeeNoSubscriptions(row.original)">
                          <Button
                            type="button"
                            variant="blue"
                            size="xs"
                            class="shrink-0"
                            aria-label="Подписки не подключены. Подключить продукты."
                            @click.stop="openConnectProductsDialog(row.original)"
                          >
                            <ListTodo class="size-3 shrink-0" aria-hidden="true" />
                            Подключить
                          </Button>
                        </template>
                        <template v-else>
                          <div class="inline-flex items-center">
                            <div
                              v-for="(item, i) in row.original.subscriptionStack"
                              :key="`${row.original.id}-sub-${item.product}`"
                              :class="cn(
                                'relative shrink-0 rounded-full border-2 border-background',
                                i > 0 && '-ml-2',
                              )"
                              :style="{ zIndex: i + 1 }"
                            >
                              <Tooltip>
                                <TooltipTrigger as-child>
                                  <button
                                    type="button"
                                    class="box-border flex size-[26px] shrink-0 cursor-default items-center justify-center overflow-hidden rounded-full outline-none"
                                    :class="subscriptionProductChipClass[item.product]"
                                  >
                                    <img
                                      :src="productIconUrls[item.product]"
                                      alt=""
                                      class="size-6 rounded-full object-contain select-none"
                                      draggable="false"
                                    >
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent variant="light" side="top" align="center" class="max-w-xs">
                                  <div>
                                    <div class="flex flex-wrap items-center gap-2">
                                      <span class="font-medium">{{ item.label }}</span>
                                      <span
                                        v-if="item.extraVariants > 0"
                                        class="bg-primary/15 text-primary inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums"
                                      >+{{ item.extraVariants }}</span>
                                    </div>
                                    <p
                                      v-if="item.extraVariants > 0"
                                      class="text-muted-foreground mt-1.5 text-xs leading-snug"
                                    >
                                      Разных купленных линеек / тарифов: {{ item.extraVariants + 1 }}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>
                    <EmployeeTagsCell
                      v-else-if="cell.column.id === 'tags'"
                      :value="row.original.tags"
                    />
                    <FlexRender
                      v-else
                      :render="cell.column.columnDef.cell"
                      :props="cell.getContext()"
                    />
                  </TableCell>
                </TableRow>
              </template>
              <TableRow v-else>
                <TableCell :colspan="visibleLeafColumnCount" class="h-24 text-center">
                  <span class="text-muted-foreground text-sm leading-snug">
                    Пользователи с такими данными не найдены
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>

    <div
      class="flex flex-col gap-3 px-0 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-foreground text-sm">
        {{ userListSummary }}
      </p>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <Button
            variant="white"
            size="sm"
            class="hover:bg-background"
            :disabled="!table.getCanPreviousPage()"
            aria-label="Предыдущая страница"
            @click="table.previousPage()"
          >
            <ChevronLeft class="size-4" />
          </Button>
          <span class="text-foreground shrink-0 rounded-md bg-muted/40 px-1 py-1 text-center text-sm leading-none tabular-nums">
            {{ table.getState().pagination.pageIndex + 1 }} из {{ table.getPageCount() }}
          </span>
          <Button
            variant="white"
            size="sm"
            class="hover:bg-background"
            :disabled="!table.getCanNextPage()"
            aria-label="Следующая страница"
            @click="table.nextPage()"
          >
            <ChevronRight class="size-4" />
          </Button>
        </div>
        <Select
          :model-value="String(table.getState().pagination.pageSize)"
          @update:model-value="onPageSizeSelect"
        >
          <SelectTrigger
            size="sm"
            class="min-w-17 shrink-0 border-border bg-background shadow-none hover:bg-background dark:hover:bg-background"
            aria-label="Количество строк на странице"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem
              v-for="opt in PAGE_SIZE_OPTIONS"
              :key="opt"
              :value="String(opt)"
            >
              {{ opt }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </main>

  <Sheet :open="sheetEmployee != null" @update:open="onEmployeeSheetOpenChange">
    <SheetContent
      side="right"
      class="flex w-full max-w-sm flex-col gap-0 overflow-y-auto p-0"
    >
      <template v-if="sheetEmployee">
        <SheetHeader class="sr-only">
          <SheetTitle>{{ sheetEmployee.fullName }}</SheetTitle>
          <SheetDescription>
            Карточка пользователя и контактные данные.
          </SheetDescription>
        </SheetHeader>

        <div class="flex flex-col items-center gap-2 px-4 pt-10 pb-8 text-center">
          <Avatar class="size-16 shrink-0 border-2 border-border">
            <AvatarImage
              :src="sheetEmployee.avatarUrl"
              :alt="sheetEmployee.fullName"
              loading="lazy"
            />
            <AvatarFallback class="text-lg font-medium text-muted-foreground">
              {{ initialsFromFullName(sheetEmployee.fullName) }}
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col gap-1">
            <button
              type="button"
              class="text-foreground cursor-pointer text-sm font-semibold underline-offset-2 hover:underline"
              aria-label="Изменить данные пользователя"
              @click="openEditUserFromSheet"
            >
              {{ sheetEmployee.fullName }}
            </button>
            <p class="text-muted-foreground text-sm leading-snug">
              {{ contactAddedLabel(sheetEmployee.id) }}
            </p>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 flex-col px-4">
          <div class="flex items-center border-border border-t py-4 text-sm">
            <div class="text-muted-foreground w-24 shrink-0">
              ID:
            </div>
            <div class="min-w-0 flex-1 font-medium text-foreground">
              {{ displayEmployeeNumericId(sheetEmployee.id) }}
            </div>
          </div>
          <div class="flex items-center border-border border-t py-4 text-sm">
            <div class="text-muted-foreground w-24 shrink-0">
              Статус
            </div>
            <div class="flex min-w-0 flex-1 items-center">
              <span
                class="inline-flex items-center gap-2 rounded-full bg-primary/15 py-1 pr-3 pl-2 text-xs font-medium text-primary"
              >
                <span class="size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Активный аккаунт
              </span>
            </div>
          </div>
          <div class="flex items-center border-border border-t py-4 text-sm">
            <div class="text-muted-foreground w-24 shrink-0">
              Email:
            </div>
            <div class="min-w-0 flex-1 truncate font-medium text-foreground">
              {{ sheetEmployee.email }}
            </div>
          </div>
          <div class="flex items-center border-border border-t py-4 text-sm">
            <div class="text-muted-foreground w-24 shrink-0">
              Телефон:
            </div>
            <div class="min-w-0 flex-1 truncate font-medium text-foreground">
              {{ sheetEmployee.phone }}
            </div>
          </div>
          <div class="flex items-center border-border border-t py-4 text-sm">
            <div class="text-muted-foreground w-24 shrink-0">
              Подписки:
            </div>
            <div class="min-w-0 flex-1 font-medium text-foreground">
              <template v-if="employeeNoSubscriptions(sheetEmployee)">
                <Button
                  type="button"
                  variant="blue"
                  size="xs"
                  class="shrink-0"
                  aria-label="Подписки не подключены. Подключить продукты."
                  @click="openConnectProductsDialogFromSheet"
                >
                  <ListTodo class="size-3 shrink-0" aria-hidden="true" />
                  Подключить
                </Button>
              </template>
              <template v-else>
                <div
                  class="max-w-full"
                  role="group"
                  :aria-label="`Подписок: ${sheetEmployee.subscriptions}. Продуктов в стопке: ${sheetEmployee.subscriptionStack.length}.`"
                >
                  <div class="inline-flex items-center gap-1">
                    <div
                      v-for="(item, i) in sheetEmployee.subscriptionStack"
                      :key="`${sheetEmployee.id}-sheet-sub-${item.product}`"
                      :class="cn(
                        'relative shrink-0 rounded-sm border-2 border-background',
                      )"
                      :style="{ zIndex: i + 1 }"
                    >
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <button
                            type="button"
                            class="box-border flex size-[26px] shrink-0 cursor-default items-center justify-center overflow-hidden rounded-sm outline-none"
                            :class="subscriptionProductChipClass[item.product]"
                          >
                            <img
                              :src="productIconUrls[item.product]"
                              alt=""
                              class="size-6 rounded-sm object-contain select-none"
                              draggable="false"
                            >
                          </button>
                        </TooltipTrigger>
                        <TooltipContent variant="light" side="top" align="center" class="max-w-xs">
                          <div>
                            <div class="flex flex-wrap items-center gap-2">
                              <span class="font-medium">{{ item.label }}</span>
                              <span
                                v-if="item.extraVariants > 0"
                                class="bg-primary/15 text-primary inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums"
                              >+{{ item.extraVariants }}</span>
                            </div>
                            <p
                              v-if="item.extraVariants > 0"
                              class="text-muted-foreground mt-1.5 text-xs leading-snug"
                            >
                              Разных купленных линеек / тарифов: {{ item.extraVariants + 1 }}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="flex items-center border-border border-t py-4 text-sm">
            <div class="text-muted-foreground w-24 shrink-0">
              Должность:
            </div>
            <div class="min-w-0 flex-1 truncate font-medium text-foreground">
              {{ sheetEmployee.position }}
            </div>
          </div>
          <div class="flex items-center border-border border-t py-4 text-sm">
            <div class="text-muted-foreground w-24 shrink-0">
              Тег:
            </div>
            <div class="min-w-0 flex-1 truncate font-medium text-foreground">
              {{ sheetEmployee.tags }}
            </div>
          </div>
          <div class="flex items-center border-border border-t py-4 text-sm">
            <div class="text-muted-foreground w-24 shrink-0">
              Роль:
            </div>
            <div class="min-w-0 flex-1 truncate font-medium text-foreground">
              {{ sheetEmployee.role }}
            </div>
          </div>
        </div>

        <SheetFooter class="mt-auto flex-row gap-2 border-border border-t p-4">
          <Button type="button" class="h-9 flex-1 gap-2" @click="openEditUserFromSheet">
            <Pencil data-icon="inline-start" />
            Изменить
          </Button>
          <Button type="button" variant="outline" class="h-9 flex-1" @click="closeEmployeeSheet">
            Закрыть
          </Button>
        </SheetFooter>
      </template>
    </SheetContent>
  </Sheet>

  <DialogRoot v-model:open="addUserDialogOpen">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/50"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex max-h-[min(90dvh,880px)] w-[calc(100vw-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <DialogTitle class="text-base font-medium text-foreground">
            {{ userFormDialogMode === 'edit' ? 'Изменить данные пользователя' : 'Добавить пользователя' }}
          </DialogTitle>
          <DialogDescription class="sr-only">
            {{
              userFormDialogMode === 'edit'
                ? 'Редактирование контактных данных и роли пользователя в организации.'
                : 'Форма добавления пользователя в организацию.'
            }}
          </DialogDescription>
          <DialogClose as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 rounded-full bg-muted text-foreground hover:bg-muted/80"
              aria-label="Закрыть"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <div class="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto px-4 py-2">
          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-avatar"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Аватар
            </span>
            <div class="flex min-w-0 flex-1 flex-wrap items-center gap-4">
              <input
                ref="addUserAvatarFileInput"
                type="file"
                accept="image/*"
                class="sr-only"
                @change="onAddUserAvatarFileChange"
              >
              <Avatar class="size-16 shrink-0 border border-border">
                <AvatarImage
                  v-if="userFormDialogAvatarDisplayUrl"
                  :src="userFormDialogAvatarDisplayUrl"
                  alt=""
                  loading="lazy"
                />
                <AvatarFallback class="text-lg font-medium text-muted-foreground">
                  <User
                    v-if="addUserAvatarInitials() === '—'"
                    class="size-7 shrink-0 opacity-70"
                    aria-hidden="true"
                  />
                  <template v-else>{{ addUserAvatarInitials() }}</template>
                </AvatarFallback>
              </Avatar>
              <div class="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  class="h-8 gap-1.5 px-2"
                  @click="addUserAvatarFileInput?.click()"
                >
                  <Upload data-icon="inline-start" />
                  Загрузить фото
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="h-8 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  :disabled="!addUserAvatarObjectUrl"
                  @click="clearAddUserAvatar"
                >
                  Удалить
                </Button>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-first-name"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Имя
            </span>
            <div class="min-w-0 flex-1">
              <Input
                id="add-user-first-name"
                aria-labelledby="add-user-caption-first-name"
                v-model="addUserForm.firstName"
                variant="default"
                class="h-10"
                autocomplete="given-name"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-last-name"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Фамилия
            </span>
            <div class="min-w-0 flex-1">
              <Input
                id="add-user-last-name"
                aria-labelledby="add-user-caption-last-name"
                v-model="addUserForm.lastName"
                variant="default"
                class="h-10"
                autocomplete="family-name"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-email"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Email
            </span>
            <div class="min-w-0 flex-1">
              <Input
                id="add-user-email"
                aria-labelledby="add-user-caption-email"
                v-model="addUserForm.email"
                type="email"
                variant="default"
                class="h-10"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-phone"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Телефон
            </span>
            <div class="min-w-0 flex-1">
              <Input
                id="add-user-phone"
                aria-labelledby="add-user-caption-phone"
                v-model="addUserForm.phone"
                type="tel"
                variant="default"
                class="h-10"
                autocomplete="tel"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-subscription"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Подписка
            </span>
            <div class="min-w-0 flex-1">
              <Popover :modal="true">
                <PopoverTrigger as-child>
                  <Button
                    id="add-user-subscriptions-trigger"
                    type="button"
                    variant="outline"
                    aria-labelledby="add-user-caption-subscription"
                    class="h-10 w-full min-w-0 justify-between gap-2 rounded-md border-border bg-background px-3 font-normal hover:bg-muted"
                    aria-haspopup="dialog"
                  >
                    <span class="flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-left">
                      <template v-if="addUserSelectedPlansOrdered.length === 0">
                        <span class="text-muted-foreground">Выберите подписки</span>
                      </template>
                      <template v-else>
                        <span class="flex min-w-0 items-center gap-0.5 overflow-hidden">
                          <span
                            v-for="row in addUserSelectedPlansPreview"
                            :key="row.code"
                            class="relative box-border flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-sm"
                            :class="addUserPlanIconBgClass[row.icon]"
                          >
                            <img
                              :src="productIconUrlsDefault[row.icon]"
                              alt=""
                              class="m-auto size-5 object-contain"
                              loading="lazy"
                            >
                          </span>
                          <span
                            v-if="addUserSelectedPlansOverflow > 0"
                            class="shrink-0 pl-0.5 text-xs text-muted-foreground tabular-nums"
                          >+{{ addUserSelectedPlansOverflow }}</span>
                        </span>
                      </template>
                    </span>
                    <ChevronDown class="size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  :side-offset="6"
                  class="z-100 w-[min(calc(100vw-2rem),420px)] max-w-[min(calc(100vw-2rem),420px)] rounded-xl border border-border p-0"
                >
                  <div class="flex flex-col gap-3 p-4">
                    <div class="relative shrink-0">
                      <Input
                        v-model="addUserPlanFilter"
                        type="search"
                        variant="secondary"
                        placeholder="Поиск подписки"
                        class="w-full placeholder:text-sm"
                        :icon-left="Search"
                        autocomplete="off"
                      />
                    </div>
                    <ScrollArea class="h-72 w-full">
                      <div class="flex flex-col gap-0.5 pr-1">
                        <label
                          v-for="row in addUserFilteredPlans"
                          :key="row.code"
                          class="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-muted"
                        >
                          <span class="flex min-w-0 flex-1 items-center gap-2">
                            <span
                              class="relative box-border flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-sm"
                              :class="addUserPlanIconBgClass[row.icon]"
                            >
                              <img
                                :src="productIconUrlsDefault[row.icon]"
                                alt=""
                                class="m-auto size-5 object-contain"
                                loading="lazy"
                              >
                            </span>
                            <span class="truncate text-sm font-medium text-foreground">{{ row.code }}</span>
                          </span>
                          <Checkbox
                            :model-value="addUserSelectedPlanCodes.includes(row.code)"
                            class="mr-2 shrink-0"
                            @update:model-value="(v) => toggleAddUserPlan(row.code, !!v)"
                          />
                        </label>
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-position"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Должность
            </span>
            <div class="min-w-0 flex-1">
              <Input
                id="add-user-position"
                aria-labelledby="add-user-caption-position"
                v-model="addUserForm.position"
                variant="default"
                class="h-10"
                autocomplete="organization-title"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-tags"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Тег
            </span>
            <div class="min-w-0 flex-1">
              <div
                id="add-user-tags-field"
                role="group"
                aria-labelledby="add-user-caption-tags"
                class="border-input focus-within:border-primary flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 transition-colors"
              >
                <span
                  v-for="(tag, idx) in addUserTagChips"
                  :key="`${tag}-${idx}`"
                  class="bg-muted text-foreground inline-flex max-w-full items-center gap-0.5 rounded-md px-2 py-0.5 text-sm"
                >
                  <span class="min-w-0 truncate">{{ tag }}</span>
                  <button
                    type="button"
                    class="text-muted-foreground hover:text-foreground -mr-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-sm outline-none"
                    :aria-label="`Удалить тег «${tag}»`"
                    @click="removeAddUserTagAt(idx)"
                  >
                    <X class="size-3.5 shrink-0" aria-hidden="true" />
                  </button>
                </span>
                <input
                  id="add-user-tags"
                  v-model="addUserTagInput"
                  type="text"
                  class="placeholder:text-text-placeholder min-w-40 flex-1 border-0 bg-transparent py-1 text-sm text-foreground outline-none"
                  placeholder="Тег и Enter или запятая"
                  autocomplete="off"
                  @keydown="onAddUserTagInputKeydown"
                  @blur="commitAddUserTagsFromInputIfPending"
                >
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 py-2 sm:flex-row sm:items-center">
            <span
              id="add-user-caption-role"
              class="w-full shrink-0 text-sm leading-snug text-muted-foreground sm:w-[120px]"
            >
              Роль
            </span>
            <div class="min-w-0 flex-1">
              <Select v-model="addUserForm.role">
                <SelectTrigger
                  id="add-user-role"
                  aria-labelledby="add-user-caption-role"
                  class="h-10 w-full min-w-0 justify-between"
                >
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in ADD_USER_ROLE_OPTIONS"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div class="flex shrink-0 justify-end gap-2 border-t border-border p-4">
          <DialogClose as-child>
            <Button type="button" variant="outline" class="h-9 bg-background px-3">
              Отменить
            </Button>
          </DialogClose>
          <Button type="button" class="h-9 px-3" @click="submitUserForm">
            {{ userFormDialogMode === 'edit' ? 'Сохранить' : 'Добавить' }}
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <DialogRoot v-model:open="connectProductsDialogOpen">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/50"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex max-h-[min(90dvh,880px)] w-[calc(100vw-2rem)] max-w-[min(480px,calc(100vw-2rem))] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div class="min-w-0 flex-1 pr-2">
            <DialogTitle class="text-base font-medium text-foreground">
              {{ connectProductsBulkMode ? 'Подписки для выбранных' : 'Добавить подписку' }}
            </DialogTitle>
            <DialogDescription
              v-if="connectProductsBulkMode"
              class="text-muted-foreground mt-0.5 text-sm leading-snug"
            >
              Будет применено к {{ selectedEmployeesCount }}
              {{ selectedEmployeesCount === 1 ? 'пользователю' : 'пользователям' }}.
            </DialogDescription>
            <DialogDescription
              v-else-if="connectProductsEmployee"
              class="text-muted-foreground mt-0.5 truncate text-sm"
            >
              {{ connectProductsEmployee.fullName }}
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 rounded-full bg-muted text-foreground hover:bg-muted/80"
              aria-label="Закрыть"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <div class="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-4 py-2">
          <div class="flex flex-col gap-3 py-2">
            <div class="relative shrink-0">
              <Input
                v-model="connectProductsPlanFilter"
                type="search"
                variant="secondary"
                placeholder="Поиск подписки"
                class="w-full placeholder:text-sm"
                :icon-left="Search"
                autocomplete="off"
              />
            </div>
            <label
              class="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-2 py-2"
            >
              <span class="text-sm font-medium text-foreground">Выбрать все</span>
              <Checkbox v-model="connectProductsSelectAllModel" aria-label="Выбрать все подписки в списке" />
            </label>
            <ScrollArea class="h-72 w-full">
              <div class="flex flex-col gap-0.5 pr-1">
                <label
                  v-for="row in connectProductsFilteredPlans"
                  :key="`connect-${row.code}`"
                  class="flex min-h-[3.25rem] cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-muted"
                >
                  <span class="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      class="relative box-border flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-sm"
                      :class="addUserPlanIconBgClass[row.icon]"
                    >
                      <img
                        :src="productIconUrlsDefault[row.icon]"
                        alt=""
                        class="m-auto size-5 object-contain"
                        loading="lazy"
                      >
                    </span>
                    <span class="truncate text-sm font-medium text-foreground">{{ row.code }}</span>
                  </span>
                  <span
                    class="text-muted-foreground shrink-0 whitespace-nowrap text-right text-xs leading-none"
                  >
                    <span>Лимиты подключений </span>
                    <span class="tabular-nums text-foreground">
                      <span
                        :class="cn(
                          'font-semibold',
                          connectProductsProjectedUsed(row) >= row.connectionsLimit
                            ? 'text-destructive'
                            : 'text-primary',
                        )"
                      >{{ connectProductsProjectedUsed(row) }}</span>
                      <span class="font-normal text-muted-foreground"> из </span>
                      <span class="font-normal">{{ row.connectionsLimit }}</span>
                    </span>
                  </span>
                  <Checkbox
                    :model-value="connectProductsSelectedCodes.includes(row.code)"
                    :disabled="isConnectProductsPlanCheckboxDisabled(row.code)"
                    class="mr-1 shrink-0"
                    :aria-label="`Подписка ${row.code}`"
                    @update:model-value="(v) => toggleConnectProductsPlan(row.code, !!v)"
                    @click.stop
                  />
                </label>
              </div>
            </ScrollArea>
          </div>
        </div>

        <div class="flex shrink-0 justify-end gap-2 border-t border-border p-4">
          <DialogClose as-child>
            <Button type="button" variant="outline" class="h-9 bg-background px-3">
              Закрыть
            </Button>
          </DialogClose>
          <Button type="button" class="h-9 px-3" @click="submitConnectProductsDialog">
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>

  <DialogRoot v-model:open="bulkMassPlaceholderOpen">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/50"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex max-h-[min(90dvh,880px)] w-[calc(100vw-2rem)] max-w-[min(480px,calc(100vw-2rem))] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div class="min-w-0 flex-1 pr-2">
            <DialogTitle class="text-base font-medium text-foreground">
              Для выбранных: {{ bulkMassPlaceholderTitle }}
            </DialogTitle>
            <DialogDescription class="text-muted-foreground mt-1 text-sm leading-relaxed">
              Выбрано
              {{ selectedEmployeesCount }}
              {{ pluralizeUsers(selectedEmployeesCount) }}.
              <template v-if="bulkMassPlaceholderKind === 'tags'">
                Новые теги будут добавлены к уже существующим у каждого пользователя.
              </template>
              <template v-else>
                Значение будет одинаковым для всех выбранных.
              </template>
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 rounded-full bg-muted text-foreground hover:bg-muted/80"
              aria-label="Закрыть"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <div class="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3">
          <template v-if="bulkMassPlaceholderKind === 'tags'">
            <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Добавить теги
            </p>
            <div
              role="group"
              aria-label="Поле ввода тегов"
              class="border-input focus-within:border-primary mb-4 flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 transition-colors"
            >
              <span
                v-for="(tag, idx) in bulkTagsChips"
                :key="`${tag}-${idx}`"
                class="bg-muted text-foreground inline-flex max-w-full items-center gap-0.5 rounded-md px-2 py-0.5 text-sm"
              >
                <span class="min-w-0 truncate">{{ tag }}</span>
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground -mr-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-sm outline-none"
                  :aria-label="`Удалить тег «${tag}»`"
                  @click="removeBulkTagAt(idx)"
                >
                  <X class="size-3.5 shrink-0" aria-hidden="true" />
                </button>
              </span>
              <input
                v-model="bulkTagsInput"
                type="text"
                class="placeholder:text-text-placeholder min-w-40 flex-1 border-0 bg-transparent py-1 text-sm text-foreground outline-none"
                placeholder="Тег и Enter или запятая"
                autocomplete="off"
                @keydown="onBulkTagsInputKeydown"
                @blur="commitBulkTagsFromInputIfPending"
              >
            </div>

            <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Общие теги
            </p>
            <p class="text-muted-foreground mb-2 text-xs leading-snug">
              Уже используются у других пользователей — нажмите, чтобы добавить в список.
            </p>
            <ScrollArea class="max-h-48 w-full">
              <div class="flex flex-wrap gap-1.5 pr-2 pb-1">
                <button
                  v-for="tag in bulkCommonTags"
                  :key="`bulk-common-${tag}`"
                  type="button"
                  :class="cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    bulkTagsChips.includes(tag)
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted',
                  )"
                  @click="toggleBulkCommonTag(tag)"
                >
                  {{ tag }}
                </button>
                <p
                  v-if="bulkCommonTags.length === 0"
                  class="text-muted-foreground text-sm"
                >
                  Пока нет общих тегов
                </p>
              </div>
            </ScrollArea>
          </template>

          <template v-else-if="bulkMassPlaceholderKind === 'department'">
            <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Новый отдел
            </p>
            <Input
              v-model="bulkDepartmentCustom"
              variant="default"
              class="mb-4 h-10"
              placeholder="Введите название, если нет в списке"
              autocomplete="organization"
              @input="bulkDepartmentSelected = ''"
            />

            <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Уже в организации
            </p>
            <ScrollArea class="max-h-56 w-full">
              <RadioGroup
                v-model="bulkDepartmentSelected"
                class="flex flex-col gap-1 pr-2"
                @update:model-value="bulkDepartmentCustom = ''"
              >
                <label
                  v-for="dept in bulkDepartmentOptions"
                  :key="`bulk-dept-${dept}`"
                  class="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <RadioGroupItem :value="dept" />
                  <span class="text-sm text-foreground">{{ dept }}</span>
                </label>
              </RadioGroup>
              <p
                v-if="bulkDepartmentOptions.length === 0"
                class="text-muted-foreground px-2 text-sm"
              >
                Нет сохранённых отделов — укажите новый выше.
              </p>
            </ScrollArea>
          </template>

          <template v-else-if="bulkMassPlaceholderKind === 'position'">
            <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Новая должность
            </p>
            <Input
              v-model="bulkPositionCustom"
              variant="default"
              class="mb-4 h-10"
              placeholder="Введите название, если нет в списке"
              autocomplete="organization-title"
              @input="bulkPositionSelected = ''"
            />

            <p class="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Уже в организации
            </p>
            <ScrollArea class="max-h-56 w-full">
              <RadioGroup
                v-model="bulkPositionSelected"
                class="flex flex-col gap-1 pr-2"
                @update:model-value="bulkPositionCustom = ''"
              >
                <label
                  v-for="pos in bulkPositionOptions"
                  :key="`bulk-pos-${pos}`"
                  class="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <RadioGroupItem :value="pos" />
                  <span class="text-sm text-foreground">{{ pos }}</span>
                </label>
              </RadioGroup>
              <p
                v-if="bulkPositionOptions.length === 0"
                class="text-muted-foreground px-2 text-sm"
              >
                Нет сохранённых должностей — укажите новую выше.
              </p>
            </ScrollArea>
          </template>
        </div>

        <div class="flex shrink-0 justify-end gap-2 border-t border-border p-4">
          <DialogClose as-child>
            <Button type="button" variant="outline" class="h-9 bg-background px-3">
              Закрыть
            </Button>
          </DialogClose>
          <Button type="button" class="h-9 px-3" @click="submitBulkMassDialog">
            Применить
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
