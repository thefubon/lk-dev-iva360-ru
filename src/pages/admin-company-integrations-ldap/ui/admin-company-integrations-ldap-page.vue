<script setup lang="ts">
import {
  Download,
  Info,
  Play,
  Plug,
} from 'lucide-vue-next'
import { useLdapConfig } from '@/app/composables/useLdapConfig'
import { useSsoProviders } from '@/app/composables/useSsoProviders'
import {
  LDAP_MODES,
  LDAP_PROTOCOLS,
  LDAP_SERVER_TYPES,
} from '@lib/ldap/types'
import { toast } from 'vue-sonner'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { AdminPageSection } from '@/widgets/admin-page-section'
import LdapAttributeMappingTab from './ldap-attribute-mapping-tab.vue'
import LdapTestDialog from './ldap-test-dialog.vue'
import SsoTestDialog from './sso-test-dialog.vue'

const LDAP_TABS = ['ldap', 'sso', 'mapping', 'autogroup', 'sync'] as const
type LdapTab = (typeof LDAP_TABS)[number]

const LDAP_TAB_LABELS: Record<LdapTab, string> = {
  ldap: 'LDAP / AD',
  sso: 'SSO (SAML / OIDC)',
  mapping: 'Маппинг атрибутов',
  autogroup: 'Автогруппировка',
  sync: 'Синхронизация',
}

const LDAP_STUB_TABS: LdapTab[] = ['autogroup', 'sync']

const DEFAULT_LDAP_TAB: LdapTab = 'ldap'

function isLdapTab(value: unknown): value is LdapTab {
  return typeof value === 'string' && LDAP_TABS.includes(value as LdapTab)
}

function tabFromQuery(queryTab: unknown): LdapTab {
  return isLdapTab(queryTab) ? queryTab : DEFAULT_LDAP_TAB
}

const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => tabFromQuery(route.query.tab),
  set: (tab: LdapTab) => {
    const query = { ...route.query }
    if (tab === DEFAULT_LDAP_TAB) {
      delete query.tab
    } else {
      query.tab = tab
    }
    void router.replace({ query })
  },
})

const ldapTabTriggerClass =
  'group/trigger inline-flex h-auto w-fit shrink-0 flex-col items-stretch gap-1 rounded-none border-0 bg-transparent p-0 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:ring-0'

const ldapTabLabelClass =
  'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-sm font-medium leading-snug transition-colors text-foreground group-data-[state=active]/trigger:bg-muted group-data-[state=inactive]/trigger:hover:bg-muted/60'

const ldapTabIndicatorClass =
  'relative z-10 -mb-px h-0.5 shrink-0 rounded-full bg-transparent transition-colors group-data-[state=active]/trigger:bg-primary'

const monoInputClass = 'h-10 font-mono text-xs sm:text-sm'

const {
  form: ldapForm,
  isDirty: ldapIsDirty,
  saving: ldapSaving,
  connectionStatus,
  statusBadgeLabel,
  ldapTestDialogOpen,
  fieldError: ldapFieldError,
  hasFieldError: ldapHasFieldError,
  saveConfig: saveLdapConfig,
  testConnection: testLdapConnection,
  onConnectionTestComplete,
} = useLdapConfig()

const ldapStatusBanner = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return {
        title: 'LDAP подключён',
        description: 'Синхронизация и вход через корпоративный каталог доступны',
        badgeClass:
          'border-primary/30 bg-primary/10 text-primary',
        dotClass: 'bg-primary',
        pingClass: 'bg-primary/40',
      }
    case 'configured':
      return {
        title: 'LDAP настроен',
        description: 'Выполните тест соединения для проверки доступности сервера',
        badgeClass:
          'border-primary/30 bg-primary/10 text-primary',
        dotClass: 'bg-primary',
        pingClass: 'bg-primary/40',
      }
    default:
      return {
        title: 'LDAP не настроен',
        description: 'Без LDAP — только вход по паролю IVA 360',
        badgeClass:
          'border-destructive/30 bg-destructive/10 text-destructive',
        dotClass: 'bg-destructive',
        pingClass: 'bg-destructive/40',
      }
  }
})

const {
  SSO_PROVIDERS,
  selectedProviderId,
  selectedProvider,
  activeSettings,
  availableProtocols,
  setupSteps,
  selectProvider,
  isProviderSelected,
} = useSsoProviders()

const ssoTestDialogOpen = ref(false)

function onTestSso() {
  ssoTestDialogOpen.value = true
}

function onDownloadSpMetadata() {
  toast.success('SP-метаданные XML', {
    description: 'Файл saml-sp-metadata.xml загружен (демо).',
  })
}
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header
      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="flex min-w-0 flex-col gap-2">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          LDAP / SSO
        </h1>
        <p class="text-muted-foreground text-sm leading-relaxed">
          Единый вход и синхронизация из корпоративного каталога
        </p>
      </div>

      <Button
        v-if="activeTab === 'ldap'"
        type="button"
        variant="outline"
        class="shrink-0 gap-1.5"
        :disabled="ldapSaving"
        @click="testLdapConnection"
      >
        <Plug
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        Тест соединения
      </Button>
    </header>

    <AdminPageSection>
      <Tabs
        v-model="activeTab"
        class="gap-6"
      >
        <nav
          class="relative flex flex-wrap items-end gap-2 border-b border-border"
          aria-label="Настройки LDAP и SSO"
        >
          <TabsList class="h-auto w-fit gap-2 rounded-none bg-transparent p-0">
            <TabsTrigger
              v-for="tab in LDAP_TABS"
              :key="tab"
              :value="tab"
              :class="ldapTabTriggerClass"
            >
              <span :class="ldapTabLabelClass">
                {{ LDAP_TAB_LABELS[tab] }}
              </span>
              <span
                aria-hidden="true"
                :class="ldapTabIndicatorClass"
              />
            </TabsTrigger>
          </TabsList>
        </nav>

        <TabsContent
          value="ldap"
          class="flex flex-col gap-4"
        >
          <div
            role="status"
            class="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3"
          >
            <span
              class="relative flex size-2.5 shrink-0"
              aria-hidden="true"
            >
              <span
                v-if="connectionStatus === 'needs_setup'"
                class="absolute inline-flex size-full animate-ping rounded-full opacity-75"
                :class="ldapStatusBanner.pingClass"
              />
              <span
                class="relative inline-flex size-2.5 rounded-full"
                :class="ldapStatusBanner.dotClass"
              />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                {{ ldapStatusBanner.title }}
              </p>
              <p class="text-muted-foreground text-xs leading-relaxed">
                {{ ldapStatusBanner.description }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium"
              :class="ldapStatusBanner.badgeClass"
            >
              {{ statusBadgeLabel }}
            </span>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <Card class="gap-4 bg-white py-4">
              <CardHeader class="px-4">
                <CardTitle class="text-base">
                  Подключение к серверу
                </CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-4 px-4">
                <Field class="gap-2">
                  <FieldLabel for="ldap-server-type">
                    Тип сервера
                  </FieldLabel>
                  <Select v-model="ldapForm.serverType">
                    <SelectTrigger
                      id="ldap-server-type"
                      class="h-10 w-full"
                    >
                      <SelectValue placeholder="Выберите тип сервера" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem
                        v-for="type in LDAP_SERVER_TYPES"
                        :key="type"
                        :value="type"
                      >
                        {{ type }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="ldap-host">
                    Хост
                  </FieldLabel>
                  <Input
                    id="ldap-host"
                    v-model="ldapForm.host"
                    type="text"
                    variant="default"
                    :class="monoInputClass"
                    placeholder="ldap.example-corp.ru"
                    autocomplete="off"
                    :aria-invalid="ldapHasFieldError('host')"
                  />
                  <FieldError :errors="ldapFieldError('host') ? [ldapFieldError('host')!] : undefined" />
                </Field>

                <div class="grid gap-4 sm:grid-cols-2">
                  <Field class="gap-2">
                    <FieldLabel for="ldap-port">
                      Порт
                    </FieldLabel>
                    <Input
                      id="ldap-port"
                      v-model="ldapForm.port"
                      type="text"
                      inputmode="numeric"
                      variant="default"
                      :class="monoInputClass"
                      autocomplete="off"
                      :aria-invalid="ldapHasFieldError('port')"
                    />
                    <FieldError :errors="ldapFieldError('port') ? [ldapFieldError('port')!] : undefined" />
                  </Field>

                  <Field class="gap-2">
                    <FieldLabel for="ldap-protocol">
                      Протокол
                    </FieldLabel>
                    <Select v-model="ldapForm.protocol">
                      <SelectTrigger
                        id="ldap-protocol"
                        class="h-10 w-full"
                      >
                        <SelectValue placeholder="Выберите протокол" />
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectItem
                          v-for="protocol in LDAP_PROTOCOLS"
                          :key="protocol"
                          :value="protocol"
                        >
                          {{ protocol }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field class="gap-2">
                  <FieldLabel for="ldap-bind-dn">
                    Bind DN
                  </FieldLabel>
                  <Input
                    id="ldap-bind-dn"
                    v-model="ldapForm.bindDn"
                    type="text"
                    variant="default"
                    :class="monoInputClass"
                    placeholder="cn=ldap-reader,cn=Users,dc=..."
                    autocomplete="off"
                    :aria-invalid="ldapHasFieldError('bindDn')"
                  />
                  <FieldError :errors="ldapFieldError('bindDn') ? [ldapFieldError('bindDn')!] : undefined" />
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="ldap-bind-password">
                    Bind Password
                  </FieldLabel>
                  <Input
                    id="ldap-bind-password"
                    v-model="ldapForm.bindPassword"
                    type="password"
                    variant="default"
                    class="h-10"
                    placeholder="••••••••"
                    autocomplete="new-password"
                    :aria-invalid="ldapHasFieldError('bindPassword')"
                  />
                  <FieldError :errors="ldapFieldError('bindPassword') ? [ldapFieldError('bindPassword')!] : undefined" />
                </Field>

                <Button
                  type="button"
                  variant="outline"
                  class="w-full gap-1.5"
                  :disabled="ldapSaving"
                  @click="testLdapConnection"
                >
                  <Plug
                    class="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  Проверить соединение
                </Button>
              </CardContent>
            </Card>

            <Card class="gap-4 bg-white py-4">
              <CardHeader class="px-4">
                <CardTitle class="text-base">
                  Режим и поиск
                </CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-4 px-4">
                <Field class="gap-2">
                  <FieldLabel for="ldap-base-dn">
                    Base DN (пользователи)
                  </FieldLabel>
                  <Input
                    id="ldap-base-dn"
                    v-model="ldapForm.baseDn"
                    type="text"
                    variant="default"
                    :class="monoInputClass"
                    placeholder="cn=Users,dc=example-corp,dc=ru"
                    autocomplete="off"
                    :aria-invalid="ldapHasFieldError('baseDn')"
                  />
                  <FieldError :errors="ldapFieldError('baseDn') ? [ldapFieldError('baseDn')!] : undefined" />
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="ldap-user-filter">
                    Фильтр пользователей
                  </FieldLabel>
                  <Input
                    id="ldap-user-filter"
                    v-model="ldapForm.userFilter"
                    type="text"
                    variant="default"
                    :class="monoInputClass"
                    autocomplete="off"
                    :aria-invalid="ldapHasFieldError('userFilter')"
                  />
                  <FieldError :errors="ldapFieldError('userFilter') ? [ldapFieldError('userFilter')!] : undefined" />
                </Field>

                <Field class="gap-3">
                  <span class="text-sm font-medium text-foreground">
                    Режим использования
                  </span>
                  <RadioGroup
                    v-model="ldapForm.mode"
                    class="flex flex-col gap-2.5"
                  >
                    <div
                      v-for="mode in LDAP_MODES"
                      :key="mode.value"
                      class="flex items-center gap-2"
                    >
                      <RadioGroupItem
                        :id="`ldap-mode-${mode.value}`"
                        :value="mode.value"
                      />
                      <Label
                        :for="`ldap-mode-${mode.value}`"
                        class="cursor-pointer text-sm font-normal"
                      >
                        {{ mode.label }}
                      </Label>
                    </div>
                  </RadioGroup>
                </Field>
              </CardContent>
            </Card>
          </div>

          <div class="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Button
              type="button"
              :variant="ldapIsDirty ? 'default' : 'secondary'"
              :disabled="!ldapIsDirty || ldapSaving"
              @click="saveLdapConfig"
            >
              Сохранить
            </Button>
            <p
              v-if="connectionStatus === 'configured'"
              class="text-muted-foreground text-xs"
            >
              После сохранения выполните тест соединения для статуса «Подключено».
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="sso"
          class="flex flex-col gap-6"
        >
          <p
            role="note"
            class="flex items-center gap-2 text-sm leading-relaxed text-foreground"
          >
            <Info
              class="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            Скачайте SP-метаданные → загрузите в IdP → нажмите «Тест SSO».
          </p>

          <div
            class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
            role="radiogroup"
            aria-label="Провайдер SSO"
          >
            <button
              v-for="provider in SSO_PROVIDERS"
              :key="provider.id"
              type="button"
              role="radio"
              :aria-checked="isProviderSelected(provider.id)"
              class="flex flex-col items-center gap-1 rounded-lg border bg-background px-3 py-4 text-center transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              :class="isProviderSelected(provider.id)
                ? 'border-primary ring-1 ring-primary/20'
                : 'border-border'"
              @click="selectProvider(provider.id)"
            >
              <span
                class="flex size-8 items-center justify-center text-primary"
                aria-hidden="true"
              >
                <component
                  :is="provider.icon"
                  v-if="provider.icon"
                  class="size-5 shrink-0"
                />
                <span
                  v-else
                  class="text-lg font-semibold leading-none"
                >
                  {{ provider.letter }}
                </span>
              </span>
              <span class="text-xs font-semibold text-foreground sm:text-sm">
                {{ provider.name }}
              </span>
              <span class="text-muted-foreground text-[10px] sm:text-xs">
                {{ provider.description }}
              </span>
            </button>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <Card class="gap-4 bg-white py-4">
              <CardHeader class="px-4">
                <CardTitle class="text-base">
                  Настройки IdP
                </CardTitle>
              </CardHeader>
              <CardContent class="flex flex-col gap-4 px-4">
                <Field class="gap-2">
                  <FieldLabel for="sso-protocol">
                    Протокол
                  </FieldLabel>
                  <Select v-model="activeSettings.protocol">
                    <SelectTrigger
                      id="sso-protocol"
                      class="h-10 w-full"
                    >
                      <SelectValue placeholder="Выберите протокол" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem
                        v-for="protocol in availableProtocols"
                        :key="protocol"
                        :value="protocol"
                      >
                        {{ protocol }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="sso-metadata-url">
                    URL метаданных IdP
                  </FieldLabel>
                  <Input
                    id="sso-metadata-url"
                    v-model="activeSettings.metadataUrl"
                    type="url"
                    variant="default"
                    :class="monoInputClass"
                    placeholder="https://sso.example.com/metadata"
                    autocomplete="off"
                  />
                </Field>

                <Field class="gap-2">
                  <FieldLabel for="sso-login-url">
                    SSO Login URL
                  </FieldLabel>
                  <Input
                    id="sso-login-url"
                    v-model="activeSettings.loginUrl"
                    type="url"
                    variant="default"
                    :class="monoInputClass"
                    placeholder="https://sso.example.com/sso"
                    autocomplete="off"
                  />
                </Field>

                <div class="flex flex-col">
                  <div class="flex items-center justify-between gap-4 border-t border-border py-3">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-foreground">
                        Принудительный SSO
                      </p>
                      <FieldDescription>
                        Отключить вход по паролю
                      </FieldDescription>
                    </div>
                    <Switch
                      id="sso-force"
                      v-model="activeSettings.forceSso"
                    />
                  </div>

                  <div class="flex items-center justify-between gap-4 border-t border-border py-3">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-foreground">
                        JIT Provisioning
                      </p>
                    </div>
                    <Switch
                      id="sso-jit"
                      v-model="activeSettings.jitProvisioning"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card class="gap-4 bg-white py-4">
              <CardHeader class="grid-cols-1 gap-2 px-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <CardTitle class="text-base">
                  SP-метаданные
                </CardTitle>
                <span
                  class="w-fit rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  Для вставки в IdP
                </span>
              </CardHeader>
              <CardContent class="flex flex-col gap-4 px-4">
                <div class="rounded-lg border border-border bg-muted/30 px-3 py-3">
                  <div class="flex items-center justify-between gap-3 py-1">
                    <span class="text-muted-foreground text-xs">
                      Entity ID
                    </span>
                    <span class="font-mono text-xs text-primary">
                      /saml/metadata
                    </span>
                  </div>
                  <div class="flex items-center justify-between gap-3 py-1">
                    <span class="text-muted-foreground text-xs">
                      ACS URL
                    </span>
                    <span class="font-mono text-xs text-primary">
                      /saml/acs
                    </span>
                  </div>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    class="flex-1 gap-1.5"
                    @click="onDownloadSpMetadata"
                  >
                    <Download
                      class="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    SP-метаданные XML
                  </Button>
                  <Button
                    type="button"
                    class="flex-1 gap-1.5"
                    @click="onTestSso"
                  >
                    <Play
                      class="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Тест SSO
                  </Button>
                </div>

                <div class="flex flex-col">
                  <div
                    v-for="(step, index) in setupSteps"
                    :key="`${selectedProviderId}-step-${index}`"
                    class="flex gap-3 py-2.5"
                    :class="index < setupSteps.length - 1 ? 'border-b border-border' : undefined"
                  >
                    <span
                      class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
                      aria-hidden="true"
                    >
                      {{ index + 1 }}
                    </span>
                    <p class="text-sm leading-relaxed text-foreground">
                      {{ step.text }}
                      <template v-if="step.emphasis">
                        <strong class="font-medium">{{ step.emphasis }}</strong>
                      </template>
                      <template v-if="step.suffix">
                        {{ step.suffix }}
                      </template>
                      <template v-if="step.code">
                        <code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">{{ step.code }}</code>
                      </template>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="mapping"
          class="flex flex-col gap-4"
        >
          <LdapAttributeMappingTab />
        </TabsContent>

        <TabsContent
          v-for="tab in LDAP_STUB_TABS"
          :key="tab"
          :value="tab"
          class="flex flex-col gap-4"
        >
          <Card class="gap-4 bg-white py-4">
            <CardHeader class="px-4">
              <CardTitle class="text-base">
                {{ LDAP_TAB_LABELS[tab] }}
              </CardTitle>
              <CardDescription>
                Раздел в разработке.
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageSection>

    <LdapTestDialog
      v-model:open="ldapTestDialogOpen"
      :host="ldapForm.host"
      @complete="onConnectionTestComplete"
    />

    <SsoTestDialog
      v-model:open="ssoTestDialogOpen"
      :provider-name="selectedProvider.name"
      :provider-description="selectedProvider.description"
      :protocol="activeSettings.protocol"
    />
  </main>
</template>
