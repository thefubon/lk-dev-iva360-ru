<script setup lang="ts">
import { Info, X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { toast } from 'vue-sonner'
import { CompanySearchCombobox } from '@/features/company-search'
import { mapLegalEntityTypeFromCompany } from '@/shared/lib/dadata/map-legal-entity-type'
import type { SelectedCompany } from '@/shared/lib/dadata/types'
import { payerToSelectedCompany } from '@/shared/lib/payers/company-to-payer'
import {
  LEGAL_ENTITY_TYPES,
  type AddPayerPayload,
  type LegalEntityType,
  type Payer,
} from '@/shared/lib/payers/types'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const PAYER_TABS = ['main', 'bank', 'contact'] as const
type PayerTab = (typeof PAYER_TABS)[number]

const props = defineProps<{
  payer?: Payer | null
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [payload: AddPayerPayload]
}>()

const isEditMode = computed(() => Boolean(props.payer))

const activeTab = ref<PayerTab>('main')
const submitted = ref(false)
const selectedCompany = ref<SelectedCompany | null>(null)
const comboboxSessionKey = ref(0)

const form = reactive({
  name: '',
  inn: '',
  kpp: '',
  ogrn: '',
  legalEntityType: 'ООО' as LegalEntityType,
  legalAddress: '',
  isDefault: false,
  bankName: '',
  bik: '',
  accountNumber: '',
  correspondentAccount: '',
  contactFullName: '',
  billingEmail: '',
  phone: '',
  signatoryTitle: '',
})

const errors = computed(() => {
  if (!submitted.value) {
    return {}
  }

  const next: Record<string, string> = {}

  if (!selectedCompany.value?.name.trim()) {
    next.name = 'Выберите организацию из подсказок DaData'
  }

  if (!form.inn.trim()) {
    next.inn = 'Укажите ИНН'
  }

  return next
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

const modalTabTriggerClass =
  'group/trigger inline-flex h-auto w-fit shrink-0 flex-col items-stretch gap-1 rounded-none border-0 bg-transparent p-0 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0'

const modalTabLabelClass =
  'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors text-foreground group-data-[state=active]/trigger:bg-muted group-data-[state=inactive]/trigger:hover:bg-muted/60'

const modalTabIndicatorClass =
  'relative z-10 -mb-px h-0.5 shrink-0 rounded-full bg-transparent transition-colors group-data-[state=active]/trigger:bg-primary'

function applyCompanyToForm(company: SelectedCompany) {
  form.name = company.name
  form.inn = company.inn
  form.kpp = company.kpp ?? ''
  form.ogrn = company.ogrn ?? ''
  form.legalEntityType =
    company.legalEntityType ?? mapLegalEntityTypeFromCompany(company)
  form.legalAddress = company.legalAddress ?? company.address ?? ''

  if (company.ownerFullName) {
    form.contactFullName = company.ownerFullName
  }

  if (company.email) {
    form.billingEmail = company.email
  }

  if (company.phone) {
    form.phone = company.phone
  }
}

function clearMainFieldsFromCompany() {
  form.name = ''
  form.inn = ''
  form.kpp = ''
  form.ogrn = ''
  form.legalEntityType = 'ООО'
  form.legalAddress = ''
}

function resetForm() {
  selectedCompany.value = null
  comboboxSessionKey.value += 1
  form.name = ''
  form.inn = ''
  form.kpp = ''
  form.ogrn = ''
  form.legalEntityType = 'ООО'
  form.legalAddress = ''
  form.isDefault = false
  form.bankName = ''
  form.bik = ''
  form.accountNumber = ''
  form.correspondentAccount = ''
  form.contactFullName = ''
  form.billingEmail = ''
  form.phone = ''
  form.signatoryTitle = ''
  activeTab.value = 'main'
  submitted.value = false
}

function populateFromPayer(payer: Payer) {
  comboboxSessionKey.value += 1
  selectedCompany.value = payerToSelectedCompany(payer)
  form.name = payer.name
  form.inn = payer.inn
  form.kpp = payer.kpp
  form.ogrn = payer.ogrn
  form.legalEntityType = payer.legalEntityType
  form.legalAddress = payer.legalAddress
  form.isDefault = payer.isDefault
  form.bankName = payer.bankName
  form.bik = payer.bik
  form.accountNumber = payer.accountNumber
  form.correspondentAccount = payer.correspondentAccount
  form.contactFullName = payer.contactFullName
  form.billingEmail = payer.billingEmail
  form.phone = payer.phone
  form.signatoryTitle = payer.signatoryTitle
  activeTab.value = 'main'
  submitted.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    return
  }

  if (props.payer) {
    populateFromPayer(props.payer)
  } else {
    resetForm()
  }
})

watch(selectedCompany, (company) => {
  if (!company) {
    clearMainFieldsFromCompany()
    return
  }

  applyCompanyToForm(company)
})

function handleCancel() {
  open.value = false
}

function handleSubmit() {
  submitted.value = true

  if (!isValid.value) {
    activeTab.value = 'main'
    return
  }

  const payload: AddPayerPayload = {
    name: form.name.trim(),
    inn: form.inn.trim(),
    kpp: form.kpp.trim(),
    ogrn: form.ogrn.trim(),
    legalEntityType: form.legalEntityType,
    legalAddress: form.legalAddress.trim(),
    isDefault: form.isDefault,
    bankName: form.bankName.trim(),
    bik: form.bik.trim(),
    accountNumber: form.accountNumber.trim(),
    correspondentAccount: form.correspondentAccount.trim(),
    contactFullName: form.contactFullName.trim(),
    billingEmail: form.billingEmail.trim(),
    phone: form.phone.trim(),
    signatoryTitle: form.signatoryTitle.trim(),
  }

  emit('submit', payload)
  open.value = false

  if (isEditMode.value) {
    toast.success('Плательщик обновлён', {
      description: payload.name,
    })
  } else {
    toast.success('Плательщик добавлен', {
      description: payload.name,
    })
  }
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/50"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex min-h-[min(70dvh,520px)] max-h-[min(90dvh,800px)] w-[calc(100vw-2rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <div class="flex shrink-0 items-start justify-between border-b border-border px-4 py-3">
          <DialogTitle class="text-base font-medium text-foreground">
            {{ isEditMode ? 'Редактировать плательщика' : 'Добавить плательщика' }}
          </DialogTitle>
          <DialogDescription class="sr-only">
            {{
              isEditMode
                ? 'Форма редактирования плательщика с основными, банковскими и контактными данными.'
                : 'Форма добавления плательщика с основными, банковскими и контактными данными.'
            }}
          </DialogDescription>
          <DialogClose as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 rounded-full bg-muted text-foreground hover:bg-muted/80"
              aria-label="Закрыть"
              @click="handleCancel"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <div
          data-modal-body
          class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4"
        >
          <div
            role="status"
            class="flex items-center gap-2 text-sm leading-snug text-foreground"
          >
            <Info
              class="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span>Плательщик — юрлицо для выставления счетов. Организация может иметь нескольких.</span>
          </div>

          <Tabs
            v-model="activeTab"
            class="gap-4"
          >
            <nav
              class="relative flex items-end gap-2 border-b border-border"
              aria-label="Разделы формы плательщика"
            >
              <TabsList class="h-auto w-fit gap-2 rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="main"
                  :class="modalTabTriggerClass"
                >
                  <span :class="modalTabLabelClass">
                    Основное
                  </span>
                  <span
                    aria-hidden="true"
                    :class="modalTabIndicatorClass"
                  />
                </TabsTrigger>
                <TabsTrigger
                  value="bank"
                  :class="modalTabTriggerClass"
                >
                  <span :class="modalTabLabelClass">
                    Банк
                  </span>
                  <span
                    aria-hidden="true"
                    :class="modalTabIndicatorClass"
                  />
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  :class="modalTabTriggerClass"
                >
                  <span :class="modalTabLabelClass">
                    Контакт
                  </span>
                  <span
                    aria-hidden="true"
                    :class="modalTabIndicatorClass"
                  />
                </TabsTrigger>
              </TabsList>
            </nav>

            <TabsContent
              value="main"
              class="flex flex-col gap-4"
            >
              <Field class="relative z-20 gap-2">
                <FieldLabel for="add-payer-name">
                  Название юрлица
                  <span class="text-destructive">*</span>
                </FieldLabel>
                <CompanySearchCombobox
                  :key="comboboxSessionKey"
                  id="add-payer-name"
                  v-model="selectedCompany"
                  in-modal
                  placeholder="Введите название или ИНН компании"
                />
                <FieldError :errors="errors.name ? [errors.name] : undefined" />
              </Field>

              <div class="grid gap-4 sm:grid-cols-2">
                <Field class="gap-2">
                  <FieldLabel for="add-payer-inn">
                    ИНН
                    <span class="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="add-payer-inn"
                    v-model="form.inn"
                    type="text"
                    variant="default"
                    class="h-10 font-mono"
                    placeholder="7701234567"
                    maxlength="12"
                    inputmode="numeric"
                  />
                  <FieldError :errors="errors.inn ? [errors.inn] : undefined" />
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="add-payer-kpp">
                    КПП
                  </FieldLabel>
                  <Input
                    id="add-payer-kpp"
                    v-model="form.kpp"
                    type="text"
                    variant="default"
                    class="h-10 font-mono"
                    placeholder="770101001"
                    maxlength="9"
                    inputmode="numeric"
                  />
                </Field>
              </div>

              <Field class="gap-2">
                <FieldLabel for="add-payer-ogrn">
                  ОГРН
                </FieldLabel>
                <Input
                  id="add-payer-ogrn"
                  v-model="form.ogrn"
                  type="text"
                  variant="default"
                  class="h-10 font-mono"
                  placeholder="1027700000001"
                  maxlength="15"
                  inputmode="numeric"
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="add-payer-legal-type">
                  Тип юрлица
                </FieldLabel>
                <Select v-model="form.legalEntityType">
                  <SelectTrigger
                    id="add-payer-legal-type"
                    class="h-10 w-full"
                  >
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="type in LEGAL_ENTITY_TYPES"
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field class="gap-2">
                <FieldLabel for="add-payer-legal-address">
                  Юридический адрес
                </FieldLabel>
                <Input
                  id="add-payer-legal-address"
                  v-model="form.legalAddress"
                  type="text"
                  variant="default"
                  class="h-10"
                  placeholder="101000, г. Москва..."
                />
              </Field>

              <div class="flex items-center justify-between gap-4 border-t border-border pt-4">
                <div class="flex flex-col gap-0.5">
                  <span class="text-sm font-medium text-foreground">
                    Плательщик по умолчанию
                  </span>
                  <span class="text-muted-foreground text-xs leading-snug">
                    Используется при оформлении новых заказов
                  </span>
                </div>
                <Switch
                  id="add-payer-is-default"
                  v-model="form.isDefault"
                  aria-label="Плательщик по умолчанию"
                />
              </div>
            </TabsContent>

            <TabsContent
              value="bank"
              class="flex flex-col gap-4"
            >
              <Field class="gap-2">
                <FieldLabel for="add-payer-bank">
                  Банк
                </FieldLabel>
                <Input
                  id="add-payer-bank"
                  v-model="form.bankName"
                  type="text"
                  variant="default"
                  class="h-10"
                  placeholder="ПАО Сбербанк"
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="add-payer-bik">
                  БИК
                </FieldLabel>
                <Input
                  id="add-payer-bik"
                  v-model="form.bik"
                  type="text"
                  variant="default"
                  class="h-10 font-mono"
                  placeholder="044525225"
                  maxlength="9"
                  inputmode="numeric"
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="add-payer-account">
                  Расчётный счёт
                </FieldLabel>
                <Input
                  id="add-payer-account"
                  v-model="form.accountNumber"
                  type="text"
                  variant="default"
                  class="h-10 font-mono"
                  placeholder="40702810938000123456"
                  maxlength="20"
                  inputmode="numeric"
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="add-payer-corr-account">
                  Кор. счёт
                </FieldLabel>
                <Input
                  id="add-payer-corr-account"
                  v-model="form.correspondentAccount"
                  type="text"
                  variant="default"
                  class="h-10 font-mono"
                  placeholder="30101810400000000225"
                  maxlength="20"
                  inputmode="numeric"
                />
              </Field>
            </TabsContent>

            <TabsContent
              value="contact"
              class="flex flex-col gap-4"
            >
              <Field class="gap-2">
                <FieldLabel for="add-payer-contact-name">
                  ФИО ответственного
                </FieldLabel>
                <Input
                  id="add-payer-contact-name"
                  v-model="form.contactFullName"
                  type="text"
                  variant="default"
                  class="h-10"
                  placeholder="Иванов Иван Иванович"
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="add-payer-billing-email">
                  Email для счетов
                </FieldLabel>
                <Input
                  id="add-payer-billing-email"
                  v-model="form.billingEmail"
                  type="email"
                  variant="default"
                  class="h-10"
                  autocomplete="email"
                  placeholder="buh@company.ru"
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="add-payer-phone">
                  Телефон
                </FieldLabel>
                <Input
                  id="add-payer-phone"
                  v-model="form.phone"
                  type="tel"
                  variant="default"
                  class="h-10"
                  autocomplete="tel"
                  placeholder="+7 (495)..."
                />
              </Field>

              <Field class="gap-2">
                <FieldLabel for="add-payer-signatory-title">
                  Должность подписанта
                </FieldLabel>
                <Input
                  id="add-payer-signatory-title"
                  v-model="form.signatoryTitle"
                  type="text"
                  variant="default"
                  class="h-10"
                  placeholder="Генеральный директор"
                />
              </Field>
            </TabsContent>
          </Tabs>
        </div>

        <div class="relative z-30 flex shrink-0 justify-end gap-2 border-t border-border bg-background px-4 py-3">
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Отмена
          </Button>
          <Button
            type="button"
            @click="handleSubmit"
          >
            {{ isEditMode ? 'Сохранить' : 'Добавить' }}
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
