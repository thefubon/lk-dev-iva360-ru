export const LDAP_STORAGE_KEY = 'iva360:ldap-config'

export const LDAP_SERVER_TYPES = [
  'Microsoft Active Directory',
  'OpenLDAP',
  'FreeIPA',
  'Samba AD',
] as const

export const LDAP_PROTOCOLS = [
  'LDAP (389)',
  'LDAPS (636)',
  'STARTTLS',
] as const

export const LDAP_MODES = [
  { value: 'auth-sync', label: 'Аутентификация + синхронизация' },
  { value: 'auth-only', label: 'Только аутентификация' },
  { value: 'address-book', label: 'Только адресная книга' },
] as const

export type LdapServerType = (typeof LDAP_SERVER_TYPES)[number]
export type LdapProtocol = (typeof LDAP_PROTOCOLS)[number]
export type LdapMode = (typeof LDAP_MODES)[number]['value']

export type LdapConnectionStatus = 'needs_setup' | 'configured' | 'connected'

export type LdapConfigField = keyof LdapConfig

export interface LdapConfig {
  serverType: LdapServerType
  host: string
  port: string
  protocol: LdapProtocol
  bindDn: string
  bindPassword: string
  baseDn: string
  userFilter: string
  mode: LdapMode
}

export interface LdapPersistedState {
  config: LdapConfig
  savedAt: string
  connectionTestPassed: boolean
  connectionTestedAt: string | null
}

export function createDefaultLdapConfig(): LdapConfig {
  return {
    serverType: LDAP_SERVER_TYPES[0],
    host: '',
    port: '389',
    protocol: LDAP_PROTOCOLS[0],
    bindDn: '',
    bindPassword: '',
    baseDn: '',
    userFilter:
      '(&(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))',
    mode: 'auth-sync',
  }
}

export function cloneLdapConfig(config: LdapConfig): LdapConfig {
  return { ...config }
}

export function ldapConfigsEqual(a: LdapConfig, b: LdapConfig): boolean {
  return (
    a.serverType === b.serverType
    && a.host === b.host
    && a.port === b.port
    && a.protocol === b.protocol
    && a.bindDn === b.bindDn
    && a.bindPassword === b.bindPassword
    && a.baseDn === b.baseDn
    && a.userFilter === b.userFilter
    && a.mode === b.mode
  )
}
