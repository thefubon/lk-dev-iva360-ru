export const LDAP_MAPPING_STORAGE_KEY = 'iva360:ldap-attribute-mapping'

export interface LdapAttributeMapping {
  id: string
  ldapAttribute: string
  fieldLabel: string
  updateOnSync: boolean
  mandatory: boolean
  isCustom: boolean
}

export interface LdapAttributeMappingPersistedState {
  mappings: LdapAttributeMapping[]
  savedAt: string
}

export const DEFAULT_LDAP_ATTRIBUTE_MAPPINGS: readonly Omit<
  LdapAttributeMapping,
  'id' | 'isCustom'
>[] = [
  {
    ldapAttribute: 'sAMAccountName',
    fieldLabel: 'Логин',
    updateOnSync: true,
    mandatory: true,
  },
  {
    ldapAttribute: 'mail',
    fieldLabel: 'Email',
    updateOnSync: true,
    mandatory: true,
  },
  {
    ldapAttribute: 'displayName',
    fieldLabel: 'Отображаемое имя',
    updateOnSync: true,
    mandatory: false,
  },
  {
    ldapAttribute: 'department',
    fieldLabel: 'Отдел',
    updateOnSync: true,
    mandatory: false,
  },
  {
    ldapAttribute: 'title',
    fieldLabel: 'Должность',
    updateOnSync: true,
    mandatory: false,
  },
  {
    ldapAttribute: 'memberOf',
    fieldLabel: 'Роль (автогруппировка)',
    updateOnSync: true,
    mandatory: false,
  },
  {
    ldapAttribute: 'thumbnailPhoto',
    fieldLabel: 'Аватар',
    updateOnSync: false,
    mandatory: false,
  },
  {
    ldapAttribute: 'userAccountControl',
    fieldLabel: 'Статус',
    updateOnSync: true,
    mandatory: false,
  },
] as const

function builtinId(ldapAttribute: string): string {
  return `builtin-${ldapAttribute}`
}

export function createDefaultLdapAttributeMappings(): LdapAttributeMapping[] {
  return DEFAULT_LDAP_ATTRIBUTE_MAPPINGS.map((row) => ({
    ...row,
    id: builtinId(row.ldapAttribute),
    isCustom: false,
  }))
}

export function cloneLdapAttributeMappings(
  mappings: LdapAttributeMapping[],
): LdapAttributeMapping[] {
  return mappings.map((row) => ({ ...row }))
}

export function ldapAttributeMappingsEqual(
  a: LdapAttributeMapping[],
  b: LdapAttributeMapping[],
): boolean {
  if (a.length !== b.length) {
    return false
  }

  return a.every((row, index) => {
    const other = b[index]
    if (!other) {
      return false
    }
    return (
      row.id === other.id
      && row.ldapAttribute === other.ldapAttribute
      && row.fieldLabel === other.fieldLabel
      && row.updateOnSync === other.updateOnSync
      && row.mandatory === other.mandatory
      && row.isCustom === other.isCustom
    )
  })
}

function isValidMappingRow(value: unknown): value is LdapAttributeMapping {
  if (!value || typeof value !== 'object') {
    return false
  }

  const row = value as LdapAttributeMapping
  return (
    typeof row.id === 'string'
    && typeof row.ldapAttribute === 'string'
    && typeof row.fieldLabel === 'string'
    && typeof row.updateOnSync === 'boolean'
    && typeof row.mandatory === 'boolean'
    && typeof row.isCustom === 'boolean'
  )
}

export function normalizePersistedMappings(
  raw: unknown,
): LdapAttributeMapping[] | null {
  if (!Array.isArray(raw)) {
    return null
  }

  const parsed = raw.filter(isValidMappingRow)
  if (parsed.length === 0) {
    return null
  }

  const defaults = createDefaultLdapAttributeMappings()
  const storedBuiltin = parsed.filter((row) => !row.isCustom)
  const customRows = parsed.filter((row) => row.isCustom)
  const merged: LdapAttributeMapping[] = []

  for (const template of defaults) {
    const stored = storedBuiltin.find(
      (row) =>
        row.ldapAttribute.toLowerCase() === template.ldapAttribute.toLowerCase(),
    )
    merged.push(
      stored
        ? {
            ...template,
            updateOnSync: stored.updateOnSync,
            mandatory: stored.mandatory,
          }
        : { ...template },
    )
  }

  for (const custom of customRows) {
    if (!merged.some((row) => row.id === custom.id)) {
      merged.push({ ...custom })
    }
  }

  return merged
}

export function createCustomMappingId(): string {
  return `custom-${Date.now()}`
}
