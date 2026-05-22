import { describe, expect, it } from 'vitest'
import {
  collectMenuHrefs,
  getActiveHref,
  normalizeMenuPathname,
} from '../../src/widgets/app-shell/app-sidebar-nav-active'
import { navMenuConfig } from '../../src/widgets/app-shell/app-sidebar-nav.config'

describe('normalizeMenuPathname', () => {
  it('maps empty to root', () => {
    expect(normalizeMenuPathname('')).toBe('/')
    expect(normalizeMenuPathname('   ')).toBe('/')
    expect(normalizeMenuPathname(undefined)).toBe('/')
  })

  it('adds leading slash and strips trailing slash', () => {
    expect(normalizeMenuPathname('company')).toBe('/company')
    expect(normalizeMenuPathname('/company/')).toBe('/company')
  })
})

describe('getActiveHref', () => {
  const hrefs = collectMenuHrefs(navMenuConfig)

  it('highlights only dashboard on /', () => {
    expect(getActiveHref('/', hrefs)).toBe('/')
    expect(getActiveHref('', hrefs)).toBe('/')
  })

  it('does not treat / as prefix of other routes', () => {
    expect(getActiveHref('/admin', hrefs)).toBe('/admin')
    expect(getActiveHref('/users/employees', hrefs)).toBe('/users/employees')
    expect(getActiveHref('/users/products', hrefs)).toBe('/users/products')
    expect(getActiveHref('/meetings/webinars', hrefs)).toBe('/meetings/webinars')
    expect(getActiveHref('/integration/ldap', hrefs)).toBe('/integration/ldap')
    expect(getActiveHref('/integration/sso', hrefs)).toBe('/integration/sso')
    expect(getActiveHref('/integration/api', hrefs)).toBe('/integration/api')
    expect(getActiveHref('/billing/products', hrefs)).toBe('/billing/products')
    expect(getActiveHref('/billing/orders', hrefs)).toBe('/billing/orders')
    expect(getActiveHref('/company', hrefs)).toBe('/company')
    expect(getActiveHref('/statistics', hrefs)).toBe('/statistics')
    expect(getActiveHref('/roadmap', hrefs)).toBe('/roadmap')
    expect(getActiveHref('/platform-docs', hrefs)).toBe('/platform-docs')
  })

  it('picks longest matching prefix', () => {
    const list = ['/users', '/users/employees', '/users/products']
    expect(getActiveHref('/users/employees', list)).toBe('/users/employees')
    expect(getActiveHref('/users/products', list)).toBe('/users/products')
    expect(getActiveHref('/users/other', list)).toBe('/users')
  })
})
