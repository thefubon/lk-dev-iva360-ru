import { mapLegalEntityTypeFromCompany } from '../dadata/map-legal-entity-type'
import type { SelectedCompany } from '../dadata/types'
import type { AddPayerPayload, Payer } from './types'

export function companyToPayerFields(
  company: SelectedCompany,
  overrides?: Partial<AddPayerPayload>,
): AddPayerPayload {
  const legalAddress = company.legalAddress ?? company.address ?? ''

  return {
    name: company.name,
    inn: company.inn,
    kpp: company.kpp ?? '',
    ogrn: company.ogrn ?? '',
    legalEntityType:
      company.legalEntityType ?? mapLegalEntityTypeFromCompany(company),
    legalAddress,
    isDefault: false,
    bankName: '',
    bik: '',
    accountNumber: '',
    correspondentAccount: '',
    contactFullName: company.ownerFullName ?? '',
    billingEmail: company.email ?? '',
    phone: company.phone ?? '',
    signatoryTitle: '',
    ...overrides,
  }
}

export function payerToSelectedCompany(payer: Payer): SelectedCompany {
  return {
    name: payer.name,
    inn: payer.inn,
    kpp: payer.kpp || undefined,
    ogrn: payer.ogrn || undefined,
    legalEntityType: payer.legalEntityType,
    address: payer.legalAddress,
    legalAddress: payer.legalAddress,
    status: 'ACTIVE',
    ownerFullName: payer.contactFullName || undefined,
    email: payer.billingEmail || undefined,
    phone: payer.phone || undefined,
  }
}
