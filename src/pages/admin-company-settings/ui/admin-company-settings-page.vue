<script setup lang="ts">
import {
  Building2,
  Check,
  Copy,
  Download,
  Globe,
  ImageIcon,
  Loader2,
  Mail,
  Phone,
  Printer,
  Upload,
  UserRound,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { ChangeOrganizationDialog } from '@/features/change-organization'
import { DEFAULT_IVA360_LOGO_URL } from '@/shared/lib/dadata/default-iva360-company'
import { loadDefaultIva360Company } from '@/shared/lib/dadata/load-default-iva360-company'
import type {
  ChangeOrganizationRequestPayload,
  SelectedCompany,
} from '@/shared/lib/dadata/types'
import { AdminPageSection } from '@/widgets/admin-page-section'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { CardDescription, CardTitle } from '@/shared/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const SETTINGS_TABS = ['organization', 'requisites'] as const
type SettingsTab = (typeof SETTINGS_TABS)[number]

const DEFAULT_SETTINGS_TAB: SettingsTab = 'organization'

function isSettingsTab(value: unknown): value is SettingsTab {
  return typeof value === 'string' && SETTINGS_TABS.includes(value as SettingsTab)
}

function tabFromQuery(queryTab: unknown): SettingsTab {
  return isSettingsTab(queryTab) ? queryTab : DEFAULT_SETTINGS_TAB
}

const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => tabFromQuery(route.query.tab),
  set: (tab: SettingsTab) => {
    const query = { ...route.query }
    if (tab === DEFAULT_SETTINGS_TAB) {
      delete query.tab
    } else {
      query.tab = tab
    }
    void router.replace({ query })
  },
})

const selectedCompany = ref<SelectedCompany | null>(null)
const defaultCompanyLoading = ref(true)

const organizationForm = reactive({
  name: '',
  ownerFullName: '',
  phone: '',
  email: '',
  website: '',
})

const LOGO_MAX_SIZE_BYTES = 5 * 1024 * 1024
const LOGO_ACCEPT = 'image/png,image/jpeg,image/jpg'
const LOGO_ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg'])

const logoFileInput = ref<HTMLInputElement | null>(null)
const logoPreviewUrl = ref<string | null>(null)
const logoBlobUrl = ref<string | null>(null)
const changeOrganizationDialogOpen = ref(false)

interface OrganizationSnapshot {
  phone: string
  email: string
  website: string
  companyInn: string | null
  hasLogo: boolean
  hasCustomLogo: boolean
}

const savedSnapshot = ref<OrganizationSnapshot | null>(null)
const settingsReady = ref(false)

/** Compare phones ignoring mask punctuation (hyphens vs spaces from maska). */
function normalizePhoneForCompare(phone: string): string {
  return phone.replace(/\D/g, '')
}

/** Format stored phone to match tel input mask before binding. */
function formatRuPhoneForInput(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  let national = digits

  if (national.length === 11 && (national.startsWith('7') || national.startsWith('8'))) {
    national = national.slice(1)
  }

  if (national.length !== 10) {
    return phone
  }

  return `+7 (${national.slice(0, 3)}) ${national.slice(3, 6)} ${national.slice(6, 8)} ${national.slice(8, 10)}`
}

function captureSnapshot(): OrganizationSnapshot {
  return {
    phone: organizationForm.phone,
    email: organizationForm.email,
    website: organizationForm.website,
    companyInn: selectedCompany.value?.inn ?? null,
    hasLogo: logoPreviewUrl.value !== null,
    hasCustomLogo: logoBlobUrl.value !== null,
  }
}

function applySnapshot() {
  savedSnapshot.value = captureSnapshot()
}

const isDirty = computed(() => {
  if (!settingsReady.value) {
    return false
  }

  const snapshot = savedSnapshot.value
  if (!snapshot) {
    return false
  }

  const current = captureSnapshot()
  return (
    normalizePhoneForCompare(current.phone) !== normalizePhoneForCompare(snapshot.phone)
    || current.email !== snapshot.email
    || current.website !== snapshot.website
    || current.companyInn !== snapshot.companyInn
    || current.hasLogo !== snapshot.hasLogo
    || current.hasCustomLogo !== snapshot.hasCustomLogo
  )
})

function saveOrganizationSettings() {
  if (!isDirty.value) {
    return
  }

  applySnapshot()
  toast.success('Настройки организации сохранены')
}

onMounted(async () => {
  try {
    selectedCompany.value = await loadDefaultIva360Company()
  } finally {
    defaultCompanyLoading.value = false
  }

  await nextTick()
  await nextTick()
  applySnapshot()
  settingsReady.value = true
})

function revokeLogoBlob() {
  if (logoBlobUrl.value) {
    URL.revokeObjectURL(logoBlobUrl.value)
    logoBlobUrl.value = null
  }
}

function applyCompanyLogo(company: SelectedCompany | null) {
  revokeLogoBlob()
  const logoUrl = company?.logoUrl
  logoPreviewUrl.value =
    logoUrl && logoUrl !== DEFAULT_IVA360_LOGO_URL ? logoUrl : null
}

const hasLogo = computed(() => logoPreviewUrl.value !== null)

function onChangeOrganizationSubmit(payload: ChangeOrganizationRequestPayload) {
  revokeLogoBlob()
  selectedCompany.value = payload.company
}

watch(selectedCompany, (company) => {
  if (company) {
    organizationForm.name = company.name
    organizationForm.ownerFullName = company.ownerFullName ?? ''
    organizationForm.phone = company.phone ? formatRuPhoneForInput(company.phone) : ''
    organizationForm.email = company.email ?? ''
    organizationForm.website = company.website ?? ''
    applyCompanyLogo(company)
  }
}, { immediate: true })

function isSvgLogoFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return file.type === 'image/svg+xml' || extension === 'svg'
}

function onLogoFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (isSvgLogoFile(file)) {
    toast.error('Формат SVG не поддерживается. Загрузите PNG или JPG.')
    return
  }

  if (!LOGO_ALLOWED_MIME_TYPES.has(file.type)) {
    toast.error('Недопустимый формат файла. Загрузите PNG или JPG.')
    return
  }

  if (file.size > LOGO_MAX_SIZE_BYTES) {
    toast.error('Файл слишком большой. Максимальный размер — 5 МБ.')
    return
  }

  revokeLogoBlob()
  logoBlobUrl.value = URL.createObjectURL(file)
  logoPreviewUrl.value = logoBlobUrl.value
}

function clearLogo() {
  revokeLogoBlob()
  logoPreviewUrl.value = null
}

onUnmounted(() => {
  revokeLogoBlob()
})

const REQUISITE_EMPTY = '—'

function formatRequisite(value?: string): string {
  const trimmed = value?.trim()
  return trimmed || REQUISITE_EMPTY
}

function organizationRequisiteValue(formValue: string, companyValue?: string): string {
  const trimmedForm = formValue.trim()
  if (trimmedForm) {
    return trimmedForm
  }

  return formatRequisite(companyValue)
}

interface RequisiteRow {
  label: string
  value: string
  mono?: boolean
}

const copiedRequisiteLabel = ref<string | null>(null)

function isRequisiteCopyable(value: string): boolean {
  const trimmed = value.trim()
  return Boolean(trimmed && trimmed !== REQUISITE_EMPTY)
}

async function copyRequisiteValue(value: string, label: string) {
  if (!isRequisiteCopyable(value)) {
    return
  }

  try {
    await navigator.clipboard.writeText(value.trim())
    copiedRequisiteLabel.value = label
    toast.success('Скопировано')
    window.setTimeout(() => {
      if (copiedRequisiteLabel.value === label) {
        copiedRequisiteLabel.value = null
      }
    }, 2000)
  } catch {
    toast.error('Не удалось скопировать')
  }
}

const requisitesCardRef = ref<HTMLElement | null>(null)
const requisitesPdfLoading = ref(false)

function printRequisites() {
  if (!requisitesCardRef.value) {
    return
  }

  window.print()
}

async function downloadRequisitesPdf() {
  const element = requisitesCardRef.value
  if (!element || requisitesPdfLoading.value) {
    return
  }

  requisitesPdfLoading.value = true

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      ignoreElements: (node) =>
        node instanceof HTMLElement && node.classList.contains('requisites-print-actions'),
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const contentWidth = pageWidth - margin * 2
    const imgHeight = (canvas.height * contentWidth) / canvas.width
    let heightLeft = imgHeight
    let position = margin

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight)
    heightLeft -= pageHeight - margin * 2

    while (heightLeft > 0) {
      pdf.addPage()
      position = margin - (imgHeight - heightLeft)
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2
    }

    const inn = selectedCompany.value?.inn?.trim()
    const filename = inn ? `rekvizity-${inn}.pdf` : 'rekvizity.pdf'
    pdf.save(filename)
  } catch {
    toast.error('Не удалось сформировать PDF')
  } finally {
    requisitesPdfLoading.value = false
  }
}

const requisitesRegistrationRows = computed<RequisiteRow[]>(() => {
  const company = selectedCompany.value
  if (!company) {
    return []
  }

  return [
    { label: 'ИНН', value: formatRequisite(company.inn), mono: true },
    { label: 'ОГРН', value: formatRequisite(company.ogrn), mono: true },
    { label: 'КПП', value: formatRequisite(company.kpp), mono: true },
  ]
})

const requisitesContactRows = computed<RequisiteRow[]>(() => {
  const company = selectedCompany.value
  if (!company) {
    return []
  }

  return [
    {
      label: 'Юридический адрес',
      value: formatRequisite(company.legalAddress ?? company.address),
    },
    { label: 'Фактический адрес', value: formatRequisite(company.actualAddress) },
    { label: 'Почтовый адрес', value: formatRequisite(company.postalAddress) },
    {
      label: 'Email',
      value: organizationRequisiteValue(organizationForm.email, company.email),
    },
    {
      label: 'Сайт',
      value: organizationRequisiteValue(organizationForm.website, company.website),
    },
  ]
})

const settingsTabTriggerClass =
  'group/trigger inline-flex h-auto w-fit shrink-0 flex-col items-stretch gap-1 rounded-none border-0 bg-transparent p-0 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0'

const settingsTabLabelClass =
  'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors text-foreground group-data-[state=active]/trigger:bg-muted group-data-[state=inactive]/trigger:hover:bg-muted/60'

const settingsTabIndicatorClass =
  'relative z-10 -mb-px h-0.5 shrink-0 rounded-full bg-transparent transition-colors group-data-[state=active]/trigger:bg-primary'
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Общие настройки
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Основные данные организации и юридические реквизиты из ЕГРЮЛ.
      </p>
    </header>

    <AdminPageSection>
      <Tabs
        v-model="activeTab"
        class="gap-6"
      >
        <nav
          class="relative flex items-end gap-2 border-b border-border"
          aria-label="Раздел общих настроек"
        >
          <TabsList class="h-auto w-fit gap-2 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="organization"
              :class="settingsTabTriggerClass"
            >
              <span :class="settingsTabLabelClass">
                Организация
              </span>
              <span
                aria-hidden="true"
                :class="settingsTabIndicatorClass"
              />
            </TabsTrigger>
            <TabsTrigger
              value="requisites"
              :class="settingsTabTriggerClass"
            >
              <span :class="settingsTabLabelClass">
                Реквизиты
              </span>
              <span
                aria-hidden="true"
                :class="settingsTabIndicatorClass"
              />
            </TabsTrigger>
          </TabsList>
        </nav>

        <TabsContent
          value="organization"
          class="w-full max-w-none"
        >
          <section class="flex w-full flex-col gap-6">
            <div class="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <div class="flex flex-col gap-6">
            <Field class="gap-2">
              <FieldLabel id="organization-name-label">
                Название организации
              </FieldLabel>
              <div class="flex items-center justify-between gap-3">
                <div
                  id="organization-name"
                  aria-labelledby="organization-name-label"
                  class="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-md border border-border bg-muted/40 px-3 py-2"
                >
                  <Building2
                    class="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span
                    v-if="defaultCompanyLoading"
                    class="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                  >
                    <Loader2
                      class="size-3.5 shrink-0 animate-spin"
                      aria-hidden="true"
                    />
                    Загрузка…
                  </span>
                  <span
                    v-else-if="organizationForm.name"
                    class="truncate text-sm font-medium text-foreground"
                  >
                    {{ organizationForm.name }}
                  </span>
                  <span
                    v-else
                    class="text-sm text-muted-foreground"
                  >
                    Не указано
                  </span>
                </div>
                <Button
                  type="button"
                  variant="default"
                  class="h-10 shrink-0"
                  :disabled="defaultCompanyLoading"
                  @click="changeOrganizationDialogOpen = true"
                >
                  Сменить владельца
                </Button>
              </div>
              <FieldDescription>
                Данные из ЕГРЮЛ. Для смены организации отправьте запрос с подтверждением.
              </FieldDescription>
            </Field>

            <Field class="gap-2">
              <FieldLabel for="organization-logo">
                Логотип
              </FieldLabel>
              <div class="flex flex-wrap items-start gap-4">
                <input
                  id="organization-logo"
                  ref="logoFileInput"
                  type="file"
                  :accept="LOGO_ACCEPT"
                  class="sr-only"
                  @change="onLogoFileChange"
                >
                <div
                  v-if="!hasLogo"
                  class="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20"
                  role="img"
                  aria-label="Логотип не добавлен"
                >
                  <ImageIcon
                    class="size-6 shrink-0 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                </div>
                <Avatar
                  v-else
                  class="size-16 shrink-0 rounded-lg border border-border"
                >
                  <AvatarImage
                    :src="logoPreviewUrl!"
                    alt=""
                    loading="lazy"
                    class="object-cover"
                  />
                  <AvatarFallback class="rounded-lg bg-muted text-muted-foreground">
                    <Building2
                      class="size-7 shrink-0 opacity-70"
                      aria-hidden="true"
                    />
                  </AvatarFallback>
                </Avatar>
                <div class="flex min-w-0 flex-col gap-2">
                  <p
                    v-if="!hasLogo"
                    class="text-sm text-muted-foreground"
                  >
                    Логотип не добавлен
                  </p>
                  <div class="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      class="h-8 gap-1.5 px-2"
                      @click="logoFileInput?.click()"
                    >
                      <Upload data-icon="inline-start" />
                      Загрузить логотип
                    </Button>
                    <Button
                      v-if="hasLogo"
                      type="button"
                      variant="outline"
                      size="sm"
                      class="h-8 text-destructive hover:bg-destructive/5 hover:text-destructive"
                      @click="clearLogo"
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
              <FieldDescription>
                PNG или JPG, не более 5 МБ. Загрузка на сервер пока не подключена.
              </FieldDescription>
            </Field>

            <Field class="gap-2">
              <FieldLabel id="organization-owner-label">
                Владелец организации (ФИО)
              </FieldLabel>
              <div
                id="organization-owner"
                aria-labelledby="organization-owner-label"
                class="flex min-h-10 min-w-0 items-center gap-2.5 rounded-md border border-border bg-muted/40 px-3 py-2"
              >
                <UserRound
                  class="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span
                  v-if="defaultCompanyLoading"
                  class="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Loader2
                    class="size-3.5 shrink-0 animate-spin"
                    aria-hidden="true"
                  />
                  Загрузка…
                </span>
                <span
                  v-else-if="organizationForm.ownerFullName"
                  class="truncate text-sm font-medium text-foreground"
                >
                  {{ organizationForm.ownerFullName }}
                </span>
                <span
                  v-else
                  class="text-sm text-muted-foreground"
                >
                  Не указан
                </span>
              </div>
              <FieldDescription>
                Данные владельца из ЕГРЮЛ. Обновляются при смене организации.
              </FieldDescription>
            </Field>

            <ChangeOrganizationDialog
              v-model:open="changeOrganizationDialogOpen"
              @submit="onChangeOrganizationSubmit"
            />
              </div>

              <div class="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-8">
            <Field class="gap-2">
              <FieldLabel for="organization-phone">
                Телефон организации
              </FieldLabel>
              <Input
                id="organization-phone"
                v-model="organizationForm.phone"
                type="tel"
                variant="default"
                class="h-10"
                autocomplete="tel"
                placeholder="+7 (000) 000 00 00"
                :icon-left="Phone"
              />
            </Field>

            <Field class="gap-2">
              <FieldLabel for="organization-email">
                Email организации
              </FieldLabel>
              <Input
                id="organization-email"
                v-model="organizationForm.email"
                type="email"
                variant="default"
                class="h-10"
                autocomplete="email"
                placeholder="email@example.com"
                :icon-left="Mail"
              />
            </Field>

            <Field class="gap-2">
              <FieldLabel for="organization-website">
                Сайт организации
              </FieldLabel>
              <Input
                id="organization-website"
                v-model="organizationForm.website"
                type="url"
                variant="default"
                class="h-10"
                autocomplete="url"
                placeholder="iva360.ru"
                :icon-left="Globe"
              />
            </Field>
              </div>
            </div>

            <div class="flex justify-start border-t border-border pt-4">
              <Button
                type="button"
                :variant="isDirty ? 'default' : 'secondary'"
                :disabled="!isDirty"
                @click="saveOrganizationSettings"
              >
                Сохранить
              </Button>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="requisites">
          <section class="flex flex-col gap-6">
            <div
              v-if="defaultCompanyLoading"
              class="flex flex-col gap-6"
            >
              <div class="flex flex-col gap-1.5">
                <CardTitle>Юридические реквизиты</CardTitle>
                <CardDescription>
                  Загрузка данных из ЕГРЮЛ…
                </CardDescription>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2
                  class="size-4 shrink-0 animate-spin"
                  aria-hidden="true"
                />
                Получение реквизитов организации из DaData
              </div>
            </div>

            <div
              v-else-if="selectedCompany"
              ref="requisitesCardRef"
              class="requisites-print-target flex flex-col gap-6"
            >
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div class="flex flex-col gap-1.5">
                  <CardTitle>Юридические реквизиты</CardTitle>
                  <CardDescription>
                    Данные организации из ЕГРЮЛ
                  </CardDescription>
                </div>
                <div class="requisites-print-actions flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="h-9 gap-2 bg-background px-3"
                    @click="printRequisites"
                  >
                    <Printer
                      class="size-4 shrink-0"
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    Распечатать
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="h-9 gap-2 bg-background px-3"
                    :disabled="requisitesPdfLoading"
                    @click="downloadRequisitesPdf"
                  >
                    <Loader2
                      v-if="requisitesPdfLoading"
                      class="size-4 shrink-0 animate-spin"
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    <Download
                      v-else
                      class="size-4 shrink-0"
                      data-icon="inline-start"
                      aria-hidden="true"
                    />
                    Скачать PDF
                  </Button>
                </div>
              </div>

              <div
                class="bg-border h-px w-full"
                role="separator"
                aria-hidden="true"
              />

              <p
                v-if="organizationForm.name"
                class="hidden print:block text-base font-semibold text-foreground"
              >
                {{ organizationForm.name }}
              </p>

              <div
                class="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-0"
              >
                <section
                  class="flex flex-col gap-4"
                  aria-labelledby="requisites-registration-heading"
                >
                  <h3
                    id="requisites-registration-heading"
                    class="border-b border-border/50 pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Регистрационные данные
                  </h3>
                  <dl class="flex flex-col gap-1">
                    <div
                      v-for="row in requisitesRegistrationRows"
                      :key="row.label"
                      class="group -mx-1 flex items-center justify-between gap-2 rounded-md px-1 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <dt class="text-xs text-muted-foreground">
                          {{ row.label }}
                        </dt>
                        <dd
                          class="text-sm leading-snug"
                          :class="[
                            row.mono ? 'font-mono tracking-tight' : '',
                            row.value === REQUISITE_EMPTY
                              ? 'font-normal text-muted-foreground'
                              : 'font-medium text-foreground',
                          ]"
                        >
                          {{ row.value }}
                        </dd>
                      </div>
                      <Button
                        v-if="isRequisiteCopyable(row.value)"
                        type="button"
                        variant="white"
                        size="icon"
                        class="requisites-print-actions shrink-0 opacity-0 transition-opacity group-hover:opacity-100 print:hidden"
                        :aria-label="`Скопировать ${row.label}`"
                        @click="copyRequisiteValue(row.value, row.label)"
                      >
                        <Check
                          v-if="copiedRequisiteLabel === row.label"
                          class="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <Copy
                          v-else
                          class="size-4 shrink-0"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </dl>
                </section>

                <div
                  class="bg-border h-px w-full lg:mx-6 lg:h-auto lg:w-px lg:self-stretch"
                  role="separator"
                  aria-hidden="true"
                />

                <section
                  class="flex flex-col gap-4"
                  aria-labelledby="requisites-contacts-heading"
                >
                  <h3
                    id="requisites-contacts-heading"
                    class="border-b border-border/50 pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Адреса и контакты
                  </h3>
                  <dl class="flex flex-col gap-1">
                    <div
                      v-for="row in requisitesContactRows"
                      :key="row.label"
                      class="group -mx-1 flex items-center justify-between gap-2 rounded-md px-1 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <dt class="text-xs text-muted-foreground">
                          {{ row.label }}
                        </dt>
                        <dd
                          class="text-sm leading-snug"
                          :class="[
                            row.mono ? 'font-mono tracking-tight' : '',
                            row.value === REQUISITE_EMPTY
                              ? 'font-normal text-muted-foreground'
                              : 'font-medium text-foreground',
                          ]"
                        >
                          {{ row.value }}
                        </dd>
                      </div>
                      <Button
                        v-if="isRequisiteCopyable(row.value)"
                        type="button"
                        variant="white"
                        size="icon"
                        class="requisites-print-actions shrink-0 opacity-0 transition-opacity group-hover:opacity-100 print:hidden"
                        :aria-label="`Скопировать ${row.label}`"
                        @click="copyRequisiteValue(row.value, row.label)"
                      >
                        <Check
                          v-if="copiedRequisiteLabel === row.label"
                          class="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <Copy
                          v-else
                          class="size-4 shrink-0"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </dl>
                </section>
              </div>
            </div>

            <div
              v-else
              class="flex flex-col gap-6"
            >
              <div class="flex flex-col gap-1.5">
                <CardTitle>Реквизиты недоступны</CardTitle>
                <CardDescription>
                  Не удалось загрузить данные организации из ЕГРЮЛ.
                </CardDescription>
              </div>
              <p class="text-muted-foreground text-sm">
                Попробуйте обновить страницу позже.
              </p>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </AdminPageSection>
  </main>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  .requisites-print-target,
  .requisites-print-target * {
    visibility: visible;
  }

  .requisites-print-target {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none !important;
    box-shadow: none !important;
  }

  .requisites-print-actions {
    display: none !important;
  }
}
</style>
