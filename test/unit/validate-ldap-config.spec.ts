import { describe, expect, it } from 'vitest'
import { createDefaultLdapConfig } from '../../src/shared/lib/ldap/types'
import { validateLdapConfig } from '../../src/shared/lib/ldap/validate-ldap-config'

function validConfig() {
  return {
    ...createDefaultLdapConfig(),
    host: 'ldap.example-corp.ru',
    port: '389',
    bindDn: 'cn=ldap-reader,cn=Users,dc=example,dc=ru',
    bindPassword: 'secret',
    baseDn: 'cn=Users,dc=example,dc=ru',
    userFilter: '(objectClass=user)',
  }
}

describe('validateLdapConfig', () => {
  it('accepts a complete valid config', () => {
    const result = validateLdapConfig(validConfig())
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('requires connection and search fields', () => {
    const result = validateLdapConfig(createDefaultLdapConfig())
    expect(result.valid).toBe(false)
    expect(result.errors.host).toBeDefined()
    expect(result.errors.bindDn).toBeDefined()
    expect(result.errors.bindPassword).toBeDefined()
    expect(result.errors.baseDn).toBeDefined()
  })

  it('rejects invalid port and filter', () => {
    const result = validateLdapConfig({
      ...validConfig(),
      port: '70000',
      userFilter: 'objectClass=user',
    })
    expect(result.errors.port).toBeDefined()
    expect(result.errors.userFilter).toBeDefined()
  })
})
