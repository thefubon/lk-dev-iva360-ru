import { describe, expect, it } from 'vitest'
import {
  mapLegalEntityTypeFromCompany,
  mapLegalEntityTypeFromPartyData,
} from '../../src/shared/lib/dadata/map-legal-entity-type'

describe('mapLegalEntityTypeFromPartyData', () => {
  it('maps INDIVIDUAL type to ИП', () => {
    expect(
      mapLegalEntityTypeFromPartyData({
        type: 'INDIVIDUAL',
        inn: '770708389301',
        name: { short_with_opf: 'ИП Иванов' },
      }),
    ).toBe('ИП')
  })

  it('maps ПАО opf short to АО', () => {
    expect(
      mapLegalEntityTypeFromPartyData({
        type: 'LEGAL',
        opf: { short: 'ПАО' },
        name: { short_with_opf: 'ПАО СБЕРБАНК' },
        inn: '7707083893',
      }),
    ).toBe('АО')
  })

  it('maps ООО opf short to ООО', () => {
    expect(
      mapLegalEntityTypeFromPartyData({
        type: 'LEGAL',
        opf: { short: 'ООО' },
        name: { short_with_opf: 'ООО Ромашка' },
        inn: '7701234567',
      }),
    ).toBe('ООО')
  })

  it('falls back to 12-digit INN for ИП', () => {
    expect(
      mapLegalEntityTypeFromPartyData({
        type: 'LEGAL',
        inn: '770708389301',
        name: { short_with_opf: 'Иванов Иван' },
      }),
    ).toBe('ИП')
  })

  it('defaults LEGAL entities without opf to ООО', () => {
    expect(
      mapLegalEntityTypeFromPartyData({
        type: 'LEGAL',
        inn: '7701234567',
        name: { short_with_opf: 'Компания без префикса' },
      }),
    ).toBe('ООО')
  })
})

describe('mapLegalEntityTypeFromCompany', () => {
  it('infers АО from company name prefix', () => {
    expect(
      mapLegalEntityTypeFromCompany({
        name: 'АО «ТехСтарт»',
        inn: '7701987654',
      }),
    ).toBe('АО')
  })

  it('infers ИП from 12-digit INN', () => {
    expect(
      mapLegalEntityTypeFromCompany({
        name: 'Иванов Иван Иванович',
        inn: '770708389301',
      }),
    ).toBe('ИП')
  })
})
