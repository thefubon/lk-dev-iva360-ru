export const LEGAL_ENTITY_TYPES = ['ООО', 'АО', 'ИП'] as const

export type LegalEntityType = (typeof LEGAL_ENTITY_TYPES)[number]

export interface Payer {
  id: string
  name: string
  inn: string
  kpp: string
  ogrn: string
  legalEntityType: LegalEntityType
  legalAddress: string
  isDefault: boolean
  bankName: string
  bik: string
  accountNumber: string
  correspondentAccount: string
  contactFullName: string
  billingEmail: string
  phone: string
  signatoryTitle: string
}

export type AddPayerPayload = Omit<Payer, 'id'>
