import { describe, expect, it } from 'vitest'
import type { SelectedCompany } from '../../src/shared/lib/dadata/types'
import {
  companyToPayerFields,
  payerToSelectedCompany,
} from '../../src/shared/lib/payers/company-to-payer'
import type { Payer } from '../../src/shared/lib/payers/types'

const sampleCompany: SelectedCompany = {
  name: 'АО «ИВА360»',
  inn: '7743314440',
  kpp: '774301001',
  ogrn: '1234567890123',
  legalEntityType: 'АО',
  address: 'г Москва, ул. Примерная, д. 1',
  legalAddress: 'г Москва, ул. Примерная, д. 1',
  status: 'ACTIVE',
  ownerFullName: 'Иванов Иван Иванович',
  email: 'info@iva360.ru',
  phone: '+7 (495) 123-45-67',
}

describe('companyToPayerFields', () => {
  it('maps DaData company to payer fields', () => {
    const fields = companyToPayerFields(sampleCompany, { isDefault: true })

    expect(fields).toMatchObject({
      name: 'АО «ИВА360»',
      inn: '7743314440',
      kpp: '774301001',
      ogrn: '1234567890123',
      legalEntityType: 'АО',
      legalAddress: 'г Москва, ул. Примерная, д. 1',
      isDefault: true,
      contactFullName: 'Иванов Иван Иванович',
      billingEmail: 'info@iva360.ru',
      phone: '+7 (495) 123-45-67',
    })
  })
})

describe('payerToSelectedCompany', () => {
  it('round-trips payer main fields for combobox', () => {
    const payer: Payer = {
      id: 'p1',
      ...companyToPayerFields(sampleCompany, { isDefault: true }),
    }

    const company = payerToSelectedCompany(payer)

    expect(company.name).toBe(payer.name)
    expect(company.inn).toBe(payer.inn)
    expect(company.kpp).toBe(payer.kpp)
    expect(company.legalAddress).toBe(payer.legalAddress)
    expect(company.ownerFullName).toBe(payer.contactFullName)
  })
})
