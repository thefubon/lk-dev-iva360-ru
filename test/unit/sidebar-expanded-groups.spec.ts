import { describe, expect, it } from 'vitest'
import {
  applySavedOpenSections,
  collectExpandableMenuKeys,
} from '../../src/shared/lib/sidebar/sidebar-expanded-groups'

const sampleConfig = [
  { type: 'item' as const, key: 'meetings', title: 'Meetings', children: [{ title: 'A', href: '/a' }] },
  { type: 'item' as const, key: 'billing', title: 'Billing', href: '/billing' },
  { type: 'divider' as const, key: 'd-1' },
  { type: 'item' as const, key: 'admin-integrations', title: 'Integrations', children: [{ title: 'LDAP', href: '/ldap' }] },
]

describe('collectExpandableMenuKeys', () => {
  it('returns only expandable item keys', () => {
    expect(collectExpandableMenuKeys(sampleConfig)).toEqual([
      'meetings',
      'admin-integrations',
    ])
  })
})

describe('applySavedOpenSections', () => {
  it('keeps defaults when nothing saved', () => {
    const base = { meetings: false, 'admin-integrations': false }
    expect(applySavedOpenSections(base, {}, sampleConfig)).toEqual(base)
  })

  it('overrides defaults from saved state', () => {
    const base = { meetings: false, 'admin-integrations': false }
    const saved = { meetings: true, 'admin-integrations': false, unknown: true }
    expect(applySavedOpenSections(base, saved, sampleConfig)).toEqual({
      meetings: true,
      'admin-integrations': false,
    })
  })
})
