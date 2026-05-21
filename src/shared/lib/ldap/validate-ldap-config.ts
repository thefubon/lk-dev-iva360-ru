import type { LdapConfig, LdapConfigField } from './types'

export interface LdapValidationResult {
  valid: boolean
  errors: Partial<Record<LdapConfigField, string>>
}

const HOST_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/

const DN_PATTERN = /=[^=]+/

export function validateLdapConfig(config: LdapConfig): LdapValidationResult {
  const errors: Partial<Record<LdapConfigField, string>> = {}

  const host = config.host.trim()
  if (!host) {
    errors.host = 'Укажите хост LDAP-сервера'
  } else if (host.length > 253 || !HOST_PATTERN.test(host)) {
    errors.host = 'Некорректный хост'
  }

  const portRaw = config.port.trim()
  const port = Number.parseInt(portRaw, 10)
  if (!portRaw) {
    errors.port = 'Укажите порт'
  } else if (!/^\d+$/.test(portRaw) || Number.isNaN(port) || port < 1 || port > 65535) {
    errors.port = 'Порт должен быть от 1 до 65535'
  }

  const bindDn = config.bindDn.trim()
  if (!bindDn) {
    errors.bindDn = 'Укажите Bind DN'
  } else if (!DN_PATTERN.test(bindDn)) {
    errors.bindDn = 'Укажите корректный DN'
  }

  if (!config.bindPassword.trim()) {
    errors.bindPassword = 'Укажите пароль Bind'
  }

  const baseDn = config.baseDn.trim()
  if (!baseDn) {
    errors.baseDn = 'Укажите Base DN'
  } else if (!DN_PATTERN.test(baseDn)) {
    errors.baseDn = 'Укажите корректный Base DN'
  }

  const userFilter = config.userFilter.trim()
  if (!userFilter) {
    errors.userFilter = 'Укажите фильтр пользователей'
  } else if (!userFilter.startsWith('(') || !userFilter.endsWith(')')) {
    errors.userFilter = 'Фильтр должен быть в формате LDAP (в скобках)'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
