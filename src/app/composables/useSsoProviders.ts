import type { Component } from 'vue'
import {
  Building2,
  Globe,
  Key,
  Settings,
} from 'lucide-vue-next'

export const SSO_PROTOCOLS = ['SAML 2.0', 'OIDC / OAuth 2.0'] as const
export type SsoProtocol = (typeof SSO_PROTOCOLS)[number]

export const SSO_PROVIDER_IDS = [
  'keycloak',
  'azure',
  'adfs',
  'yandex',
  'custom',
] as const
export type SsoProviderId = (typeof SSO_PROVIDER_IDS)[number]

export interface SsoProviderSettings {
  protocol: SsoProtocol
  metadataUrl: string
  loginUrl: string
  forceSso: boolean
  jitProvisioning: boolean
}

export interface SsoProviderOption {
  id: SsoProviderId
  name: string
  description: string
  icon?: Component
  letter?: string
  protocols: readonly SsoProtocol[]
}

export interface SsoSetupStep {
  text: string
  emphasis?: string
  code?: string
  suffix?: string
}

export const SSO_PROVIDERS: SsoProviderOption[] = [
  {
    id: 'keycloak',
    name: 'Keycloak',
    description: 'SAML / OIDC',
    icon: Key,
    protocols: SSO_PROTOCOLS,
  },
  {
    id: 'azure',
    name: 'Azure AD',
    description: 'SAML / OIDC',
    icon: Globe,
    protocols: SSO_PROTOCOLS,
  },
  {
    id: 'adfs',
    name: 'ADFS',
    description: 'SAML 2.0',
    icon: Building2,
    protocols: ['SAML 2.0'],
  },
  {
    id: 'yandex',
    name: 'Яндекс 360',
    description: 'OIDC',
    letter: 'Я',
    protocols: ['OIDC / OAuth 2.0'],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'SAML / OIDC',
    icon: Settings,
    protocols: SSO_PROTOCOLS,
  },
]

const DEFAULT_PROVIDER_SETTINGS: Record<SsoProviderId, SsoProviderSettings> = {
  keycloak: {
    protocol: 'SAML 2.0',
    metadataUrl: 'https://keycloak.example.com/realms/iva360/protocol/saml/descriptor',
    loginUrl: 'https://keycloak.example.com/realms/iva360/protocol/saml',
    forceSso: false,
    jitProvisioning: true,
  },
  azure: {
    protocol: 'SAML 2.0',
    metadataUrl: 'https://login.microsoftonline.com/{tenant-id}/federationmetadata/2007-06/federationmetadata.xml',
    loginUrl: 'https://login.microsoftonline.com/{tenant-id}/saml2',
    forceSso: false,
    jitProvisioning: true,
  },
  adfs: {
    protocol: 'SAML 2.0',
    metadataUrl: 'https://adfs.example.com/FederationMetadata/2007-06/FederationMetadata.xml',
    loginUrl: 'https://adfs.example.com/adfs/ls/',
    forceSso: false,
    jitProvisioning: true,
  },
  yandex: {
    protocol: 'OIDC / OAuth 2.0',
    metadataUrl: 'https://oauth.yandex.ru/.well-known/openid-configuration',
    loginUrl: 'https://oauth.yandex.ru/authorize',
    forceSso: false,
    jitProvisioning: true,
  },
  custom: {
    protocol: 'SAML 2.0',
    metadataUrl: '',
    loginUrl: '',
    forceSso: false,
    jitProvisioning: true,
  },
}

const SETUP_STEPS: Record<SsoProviderId, SsoSetupStep[]> = {
  keycloak: [
    {
      text: 'Keycloak:',
      emphasis: 'Realm → Clients → Create',
      suffix: ', тип',
      code: 'SAML',
    },
    { text: 'Вставьте Entity ID и ACS URL' },
    { text: 'Нажмите', emphasis: 'Тест SSO' },
  ],
  azure: [
    {
      text: 'Azure AD:',
      emphasis: 'Enterprise applications → New application',
      suffix: ', выберите SAML SSO',
    },
    { text: 'Вставьте Entity ID и Reply URL (ACS)' },
    { text: 'Нажмите', emphasis: 'Тест SSO' },
  ],
  adfs: [
    {
      text: 'ADFS:',
      emphasis: 'Add Relying Party Trust',
      suffix: ', тип',
      code: 'SAML 2.0',
    },
    { text: 'Вставьте Entity ID и ACS URL' },
    { text: 'Нажмите', emphasis: 'Тест SSO' },
  ],
  yandex: [
    {
      text: 'Яндекс 360:',
      emphasis: 'OAuth-приложение → Создать',
      suffix: ', тип',
      code: 'OIDC',
    },
    { text: 'Укажите Redirect URI из SP-метаданных' },
    { text: 'Нажмите', emphasis: 'Тест SSO' },
  ],
  custom: [
    {
      text: 'Создайте SAML/OIDC-приложение в вашем IdP',
    },
    { text: 'Вставьте Entity ID и ACS URL (или Redirect URI для OIDC)' },
    { text: 'Нажмите', emphasis: 'Тест SSO' },
  ],
}

function cloneProviderSettings(
  settings: SsoProviderSettings,
): SsoProviderSettings {
  return { ...settings }
}

function createInitialProvidersState(): Record<SsoProviderId, SsoProviderSettings> {
  return SSO_PROVIDER_IDS.reduce(
    (state, id) => {
      state[id] = cloneProviderSettings(DEFAULT_PROVIDER_SETTINGS[id])
      return state
    },
    {} as Record<SsoProviderId, SsoProviderSettings>,
  )
}

export function useSsoProviders(initialProviderId: SsoProviderId = 'keycloak') {
  const selectedProviderId = ref<SsoProviderId>(initialProviderId)
  const providers = reactive(createInitialProvidersState())

  const selectedProvider = computed(
    () => SSO_PROVIDERS.find((provider) => provider.id === selectedProviderId.value)!,
  )

  const activeSettings = computed(
    () => providers[selectedProviderId.value],
  )

  const availableProtocols = computed(
    () => selectedProvider.value.protocols,
  )

  const setupSteps = computed(
    () => SETUP_STEPS[selectedProviderId.value],
  )

  function selectProvider(id: SsoProviderId) {
    selectedProviderId.value = id
  }

  function isProviderSelected(id: SsoProviderId) {
    return selectedProviderId.value === id
  }

  return {
    SSO_PROVIDERS,
    selectedProviderId,
    selectedProvider,
    providers,
    activeSettings,
    availableProtocols,
    setupSteps,
    selectProvider,
    isProviderSelected,
  }
}
