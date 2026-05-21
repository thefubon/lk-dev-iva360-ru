import type { LegalEntityType } from '@/shared/lib/payers/types'

export type DadataPartyStatus =
  | 'ACTIVE'
  | 'LIQUIDATING'
  | 'LIQUIDATED'
  | 'BANKRUPT'
  | 'REORGANIZING'

export interface DadataPartyAddressData {
  source?: string | null
  postal_code?: string | null
  qc?: string | null
}

export interface DadataPartyAddress {
  value?: string | null
  unrestricted_value?: string | null
  data?: DadataPartyAddressData | null
}

export interface DadataPartyName {
  full_with_opf?: string | null
  short_with_opf?: string | null
  full?: string | null
  short?: string | null
}

export interface DadataPartyOpf {
  code?: string | null
  full?: string | null
  short?: string | null
}

export type DadataPartyEntityType = 'LEGAL' | 'INDIVIDUAL'

export interface DadataPartyManagement {
  name?: string | null
  post?: string | null
}

export interface DadataPartyPhone {
  value?: string | null
  unrestricted_value?: string | null
}

export interface DadataPartyEmailData {
  source?: string | null
  local?: string | null
  domain?: string | null
}

export interface DadataPartyEmail {
  value?: string | null
  unrestricted_value?: string | null
  source?: string | null
  data?: DadataPartyEmailData | null
}

export interface DadataPartyData {
  inn?: string | null
  kpp?: string | null
  ogrn?: string | null
  type?: DadataPartyEntityType | null
  opf?: DadataPartyOpf | null
  name?: DadataPartyName | null
  address?: DadataPartyAddress | null
  management?: DadataPartyManagement | null
  phones?: DadataPartyPhone[] | null
  emails?: DadataPartyEmail[] | null
  state?: {
    status?: DadataPartyStatus | null
  } | null
}

export interface DadataPartySuggestion {
  value: string
  unrestricted_value?: string
  data: DadataPartyData
}

export interface DadataPartySuggestResponse {
  suggestions: DadataPartySuggestion[]
}

export interface SelectedCompany {
  name: string
  inn: string
  legalEntityType?: LegalEntityType
  kpp?: string
  ogrn?: string
  /** Юридический адрес (как в ЕГРЮЛ); дублирует legalAddress для обратной совместимости. */
  address: string
  legalAddress?: string
  actualAddress?: string
  postalAddress?: string
  website?: string
  status: DadataPartyStatus
  ownerFullName?: string
  email?: string
  phone?: string
  logoUrl?: string
}

export interface DadataFioData {
  surname?: string | null
  name?: string | null
  patronymic?: string | null
  gender?: string | null
}

export interface DadataFioSuggestion {
  value: string
  unrestricted_value?: string
  data: DadataFioData
}

export interface DadataFioSuggestResponse {
  suggestions: DadataFioSuggestion[]
}

export interface SelectedFio {
  fullName: string
  surname?: string
  name?: string
  patronymic?: string
}

export interface ChangeOwnerRequestPayload {
  ownerFullName: string
  email: string
  reason: string
}

export interface ChangeOrganizationRequestPayload {
  company: SelectedCompany
  ownerEmail: string
  reason: string
}
