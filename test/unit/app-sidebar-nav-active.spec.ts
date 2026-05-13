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
    expect(getActiveHref('/company', hrefs)).toBe('/company')
    expect(getActiveHref('/users/employees', hrefs)).toBe('/users/employees')
    expect(getActiveHref('/billing/products', hrefs)).toBe('/billing/products')
    expect(getActiveHref('/billing/orders', hrefs)).toBe('/billing/orders')
    expect(getActiveHref('/meetings/webinars', hrefs)).toBe('/meetings/webinars')
    expect(getActiveHref('/integration/api', hrefs)).toBe('/integration/api')
    expect(getActiveHref('/integration', hrefs)).toBe('/integration')
  })

  it('picks longest matching prefix', () => {
    const list = ['/users', '/users/employees']
    expect(getActiveHref('/users/employees', list)).toBe('/users/employees')
    expect(getActiveHref('/users/other', list)).toBe('/users')
  })
})
