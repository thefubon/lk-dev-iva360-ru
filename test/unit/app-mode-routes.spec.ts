import { describe, expect, it } from 'vitest'
import {
  addAdminPrefix,
  DEFAULT_ADMIN_ROUTE,
  DEFAULT_USER_ROUTE,
  isAdminRoute,
  normalizeAppPath,
  stripAdminPrefix,
  toAdminRoute,
  toUserRoute,
} from '../../src/shared/lib/app-mode-routes'

describe('app-mode-routes', () => {
  it('normalizes paths', () => {
    expect(normalizeAppPath('')).toBe('/')
    expect(normalizeAppPath('users/employees')).toBe('/users/employees')
    expect(normalizeAppPath('/users/employees/')).toBe('/users/employees')
  })

  it('detects admin routes', () => {
    expect(isAdminRoute('/admin')).toBe(true)
    expect(isAdminRoute('/admin/users/employees')).toBe(true)
    expect(isAdminRoute('/users/employees')).toBe(false)
    expect(isAdminRoute('/')).toBe(false)
  })

  it('adds and strips admin prefix', () => {
    expect(addAdminPrefix('/')).toBe('/admin')
    expect(addAdminPrefix('/users/employees')).toBe('/admin/users/employees')
    expect(addAdminPrefix('/admin/users/employees')).toBe('/admin/users/employees')

    expect(stripAdminPrefix('/admin')).toBe('/')
    expect(stripAdminPrefix('/admin/users/employees')).toBe('/users/employees')
    expect(stripAdminPrefix('/users/employees')).toBe('/users/employees')
  })

  it('converts between user and admin routes', () => {
    expect(toAdminRoute('/users/employees')).toBe('/admin/users/employees')
    expect(toAdminRoute('/admin/users/employees')).toBe('/admin/users/employees')
    expect(toUserRoute('/admin/users/employees')).toBe('/users/employees')
    expect(toUserRoute('/admin')).toBe('/')
  })

  it('exposes default routes for mode switching', () => {
    expect(DEFAULT_USER_ROUTE).toBe('/')
    expect(DEFAULT_ADMIN_ROUTE).toBe('/admin')
  })
})
