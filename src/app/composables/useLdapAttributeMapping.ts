import { toast } from 'vue-sonner'
import {
  cloneLdapAttributeMappings,
  createCustomMappingId,
  createDefaultLdapAttributeMappings,
  type LdapAttributeMapping,
  type LdapAttributeMappingPersistedState,
  LDAP_MAPPING_STORAGE_KEY,
  normalizePersistedMappings,
} from '@lib/ldap/ldap-attribute-mapping'

function readPersistedState(): LdapAttributeMappingPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(LDAP_MAPPING_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as {
      mappings?: unknown
      savedAt?: string
    }

    const mappings = normalizePersistedMappings(parsed.mappings)
    if (!mappings || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { mappings, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(mappings: LdapAttributeMapping[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: LdapAttributeMappingPersistedState = {
      mappings: cloneLdapAttributeMappings(mappings),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(LDAP_MAPPING_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export interface AddCustomMappingPayload {
  ldapAttribute: string
  fieldLabel: string
  updateOnSync: boolean
  mandatory: boolean
}

export function useLdapAttributeMapping() {
  const mappings = ref<LdapAttributeMapping[]>(createDefaultLdapAttributeMappings())
  const ready = ref(false)
  const customDialogOpen = ref(false)

  function persist() {
    writePersistedState(mappings.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    mappings.value = persisted?.mappings ?? createDefaultLdapAttributeMappings()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function findMapping(id: string): LdapAttributeMapping | undefined {
    return mappings.value.find((row) => row.id === id)
  }

  function updateMapping(
    id: string,
    patch: Partial<Pick<LdapAttributeMapping, 'updateOnSync' | 'mandatory'>>,
  ) {
    const row = findMapping(id)
    if (!row) {
      return
    }

    Object.assign(row, patch)
    persist()
  }

  function ldapAttributeExists(
    ldapAttribute: string,
    excludeId?: string,
  ): boolean {
    const normalized = ldapAttribute.trim().toLowerCase()
    if (!normalized) {
      return false
    }

    return mappings.value.some(
      (row) =>
        row.id !== excludeId
        && row.ldapAttribute.trim().toLowerCase() === normalized,
    )
  }

  function addCustomMapping(payload: AddCustomMappingPayload): boolean {
    const ldapAttribute = payload.ldapAttribute.trim()
    const fieldLabel = payload.fieldLabel.trim()

    if (!ldapAttribute) {
      toast.error('Укажите LDAP-атрибут')
      return false
    }

    if (!fieldLabel) {
      toast.error('Укажите поле IVA 360')
      return false
    }

    if (ldapAttributeExists(ldapAttribute)) {
      toast.error('Такой LDAP-атрибут уже есть в таблице')
      return false
    }

    mappings.value.push({
      id: createCustomMappingId(),
      ldapAttribute,
      fieldLabel,
      updateOnSync: payload.updateOnSync,
      mandatory: payload.mandatory,
      isCustom: true,
    })
    persist()
    toast.success('Кастомный маппинг добавлен')
    return true
  }

  function removeCustomMapping(id: string) {
    const row = findMapping(id)
    if (!row?.isCustom) {
      return
    }

    mappings.value = mappings.value.filter((item) => item.id !== id)
    persist()
    toast.success('Маппинг удалён')
  }

  function resetToDefaults() {
    mappings.value = createDefaultLdapAttributeMappings()
    persist()
  }

  return {
    mappings,
    ready,
    customDialogOpen,
    updateMapping,
    addCustomMapping,
    removeCustomMapping,
    ldapAttributeExists,
    resetToDefaults,
    persist,
  }
}
