import { toast } from 'vue-sonner'
import {
  cloneLdapConfig,
  createDefaultLdapConfig,
  type LdapConfig,
  type LdapConfigField,
  type LdapConnectionStatus,
  type LdapPersistedState,
  ldapConfigsEqual,
  LDAP_STORAGE_KEY,
} from '@lib/ldap/types'
import { validateLdapConfig } from '@lib/ldap/validate-ldap-config'

function readPersistedState(): LdapPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(LDAP_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as LdapPersistedState
    if (!parsed?.config || typeof parsed.savedAt !== 'string') {
      return null
    }

    return {
      config: { ...createDefaultLdapConfig(), ...parsed.config },
      savedAt: parsed.savedAt,
      connectionTestPassed: Boolean(parsed.connectionTestPassed),
      connectionTestedAt:
        typeof parsed.connectionTestedAt === 'string'
          ? parsed.connectionTestedAt
          : null,
    }
  } catch {
    return null
  }
}

function writePersistedState(state: LdapPersistedState | null) {
  if (!import.meta.client) {
    return
  }

  try {
    if (!state) {
      localStorage.removeItem(LDAP_STORAGE_KEY)
      return
    }
    localStorage.setItem(LDAP_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function useLdapConfig() {
  const form = reactive(createDefaultLdapConfig())
  const savedState = ref<LdapPersistedState | null>(null)
  const fieldErrors = ref<Partial<Record<LdapConfigField, string>>>({})
  const showValidation = ref(false)
  const saving = ref(false)
  const ready = ref(false)
  const ldapTestDialogOpen = ref(false)

  const validation = computed(() => validateLdapConfig(form))

  const isDirty = computed(() => {
    if (!savedState.value) {
      return true
    }
    return !ldapConfigsEqual(form, savedState.value.config)
  })

  const connectionStatus = computed<LdapConnectionStatus>(() => {
    if (!validation.value.valid) {
      return 'needs_setup'
    }
    if (!savedState.value || isDirty.value) {
      return 'needs_setup'
    }
    if (savedState.value.connectionTestPassed) {
      return 'connected'
    }
    return 'configured'
  })

  const statusBadgeLabel = computed(() => {
    switch (connectionStatus.value) {
      case 'connected':
        return 'Подключено'
      case 'configured':
        return 'Настроено'
      default:
        return 'Требует настройки'
    }
  })

  const isConfigured = computed(
    () => connectionStatus.value !== 'needs_setup',
  )

  function applyFieldErrors(
    errors: Partial<Record<LdapConfigField, string>>,
  ) {
    fieldErrors.value = errors
    showValidation.value = true
  }

  function clearFieldErrors() {
    fieldErrors.value = {}
    showValidation.value = false
  }

  function fieldError(field: LdapConfigField): string | undefined {
    return showValidation.value ? fieldErrors.value[field] : undefined
  }

  function hasFieldError(field: LdapConfigField): boolean {
    return Boolean(fieldError(field))
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    savedState.value = persisted
    if (persisted) {
      Object.assign(form, cloneLdapConfig(persisted.config))
    }
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  async function saveConfig(): Promise<boolean> {
    const result = validateLdapConfig(form)
    if (!result.valid) {
      applyFieldErrors(result.errors)
      toast.error('Не удалось сохранить', {
        description: 'Заполните обязательные поля LDAP.',
      })
      return false
    }

    clearFieldErrors()
    saving.value = true

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const config = cloneLdapConfig(form)
      const previousTestPassed = Boolean(
        savedState.value?.connectionTestPassed
        && ldapConfigsEqual(config, savedState.value.config),
      )

      savedState.value = {
        config,
        savedAt: new Date().toISOString(),
        connectionTestPassed: previousTestPassed,
        connectionTestedAt: previousTestPassed
          ? savedState.value?.connectionTestedAt ?? null
          : null,
      }
      writePersistedState(savedState.value)
      toast.success('Настройки LDAP сохранены')
      return true
    } finally {
      saving.value = false
    }
  }

  async function testConnection(): Promise<void> {
    const result = validateLdapConfig(form)
    if (!result.valid) {
      applyFieldErrors(result.errors)
      toast.error('Проверка соединения', {
        description: 'Заполните обязательные поля перед тестом.',
      })
      return
    }

    if (isDirty.value || !savedState.value) {
      const saved = await saveConfig()
      if (!saved) {
        return
      }
    }

    clearFieldErrors()
    ldapTestDialogOpen.value = true
  }

  function onConnectionTestComplete(success: boolean) {
    if (!savedState.value || isDirty.value) {
      return
    }

    savedState.value = {
      ...savedState.value,
      connectionTestPassed: success,
      connectionTestedAt: new Date().toISOString(),
    }
    writePersistedState(savedState.value)

    if (success) {
      toast.success('Соединение с LDAP установлено')
    } else {
      toast.error('Не удалось подключиться к LDAP')
    }
  }

  return {
    form,
    fieldErrors,
    showValidation,
    saving,
    ready,
    validation,
    isDirty,
    connectionStatus,
    statusBadgeLabel,
    isConfigured,
    ldapTestDialogOpen,
    fieldError,
    hasFieldError,
    saveConfig,
    testConnection,
    onConnectionTestComplete,
  }
}
