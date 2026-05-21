import { describe, expect, it } from 'vitest'
import {
  mapPartySuggestionToCompany,
  pickLegalAddress,
  pickPartyWebsite,
  pickPostalAddress,
} from '../../src/shared/lib/dadata/map-party-suggestion'
import type { DadataPartySuggestion } from '../../src/shared/lib/dadata/types'

function partySuggestion(
  data: DadataPartySuggestion['data'],
  value = 'Test Company',
): DadataPartySuggestion {
  return { value, data }
}

describe('mapPartySuggestionToCompany', () => {
  it('maps email from data.emails[].data.source', () => {
    const company = mapPartySuggestionToCompany(
      partySuggestion({
        inn: '7707083893',
        name: { short_with_opf: 'ПАО СБЕРБАНК' },
        address: { value: 'г Москва' },
        state: { status: 'ACTIVE' },
        emails: [
          {
            value: 'DAP@MOTORICA.ORG',
            unrestricted_value: 'DAP@MOTORICA.ORG',
            data: {
              local: 'DAP',
              domain: 'MOTORICA.ORG',
              source: 'DAP@MOTORICA.ORG',
            },
          },
        ],
      }),
    )

    expect(company.email).toBe('DAP@MOTORICA.ORG')
    expect(company.legalEntityType).toBe('АО')
  })

  it('maps email from value when source is missing', () => {
    const company = mapPartySuggestionToCompany(
      partySuggestion({
        inn: '1234567890',
        name: { short_with_opf: 'ООО Тест' },
        address: { value: 'г Москва' },
        state: { status: 'ACTIVE' },
        emails: [
          {
            value: 'billing@example.ru',
            unrestricted_value: 'billing@example.ru',
          },
        ],
      }),
    )

    expect(company.email).toBe('billing@example.ru')
  })

  it('maps email from local and domain when value is missing', () => {
    const company = mapPartySuggestionToCompany(
      partySuggestion({
        inn: '1234567890',
        name: { short_with_opf: 'ООО Тест' },
        address: { value: 'г Москва' },
        state: { status: 'ACTIVE' },
        emails: [
          {
            data: {
              local: 'info',
              domain: 'example.ru',
            },
          },
        ],
      }),
    )

    expect(company.email).toBe('info@example.ru')
  })

  it('leaves email undefined when DaData has no emails', () => {
    const company = mapPartySuggestionToCompany(
      partySuggestion({
        inn: '7707083893',
        name: { short_with_opf: 'ПАО СБЕРБАНК' },
        address: { value: 'г Москва' },
        state: { status: 'ACTIVE' },
        emails: null,
        management: { name: 'Греф Герман Оскарович' },
      }),
    )

    expect(company.email).toBeUndefined()
    expect(company.ownerFullName).toBe('Греф Герман Оскарович')
  })

  it('maps legal address from address.data.source and postal from unrestricted_value', () => {
    const address = {
      value: 'г Москва, Волгоградский пр-кт, д 42 к 5',
      unrestricted_value: '109316, г Москва, Волгоградский пр-кт, д 42 к 5, помещ 1Н',
      data: {
        source: 'г Москва, Волгоградский пр-кт, д 42 к 5, помещ 1Н',
      },
    }

    expect(pickLegalAddress(address)).toBe(
      'г Москва, Волгоградский пр-кт, д 42 к 5, помещ 1Н',
    )
    expect(pickPostalAddress(address)).toBe(
      '109316, г Москва, Волгоградский пр-кт, д 42 к 5, помещ 1Н',
    )

    const company = mapPartySuggestionToCompany(
      partySuggestion({
        inn: '7707083893',
        ogrn: '1027700132195',
        kpp: '770701001',
        name: { short_with_opf: 'ПАО СБЕРБАНК' },
        address,
        state: { status: 'ACTIVE' },
      }),
    )

    expect(company.legalAddress).toBe('г Москва, Волгоградский пр-кт, д 42 к 5, помещ 1Н')
    expect(company.postalAddress).toBe(
      '109316, г Москва, Волгоградский пр-кт, д 42 к 5, помещ 1Н',
    )
    expect(company.address).toBe(company.legalAddress)
    expect(company.actualAddress).toBeUndefined()
  })

  it('maps website from corporate email domain', () => {
    const data = {
      inn: '1234567890',
      name: { short_with_opf: 'ООО Тест' },
      address: { value: 'г Москва' },
      state: { status: 'ACTIVE' as const },
      emails: [
        {
          data: {
            local: 'info',
            domain: 'iva360.ru',
            source: 'info@iva360.ru',
          },
        },
      ],
    }

    expect(pickPartyWebsite(data)).toBe('https://iva360.ru')

    const company = mapPartySuggestionToCompany(partySuggestion(data))
    expect(company.website).toBe('https://iva360.ru')
  })

  it('does not map website from generic email provider', () => {
    const data = {
      inn: '1234567890',
      name: { short_with_opf: 'ООО Тест' },
      address: { value: 'г Москва' },
      state: { status: 'ACTIVE' as const },
      emails: [
        {
          value: 'billing@mail.ru',
        },
      ],
    }

    expect(pickPartyWebsite(data)).toBeUndefined()
  })
})
