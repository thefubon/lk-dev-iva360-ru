import type { LegalEntityType } from '@/shared/lib/payers/types'
import type { DadataPartyData, SelectedCompany } from './types'

const AO_OPF_SHORT = new Set(['ПАО', 'АО', 'ОАО', 'ЗАО', 'НАО'])
const OPF_NAME_SUFFIX = '(?:\\s|«|$)'
const AO_NAME_PREFIX = new RegExp(`^(ПАО|АО|ОАО|ЗАО|НАО)${OPF_NAME_SUFFIX}`, 'i')
const IP_NAME_PREFIX = new RegExp(`^ИП${OPF_NAME_SUFFIX}`, 'i')

function normalizeOpfShort(value?: string | null): string | undefined {
  const trimmed = value?.trim().toUpperCase()
  return trimmed || undefined
}

function mapFromOpfShort(opfShort?: string): LegalEntityType | undefined {
  if (!opfShort) {
    return undefined
  }

  if (opfShort === 'ИП') {
    return 'ИП'
  }

  if (AO_OPF_SHORT.has(opfShort)) {
    return 'АО'
  }

  if (opfShort === 'ООО') {
    return 'ООО'
  }

  return undefined
}

function mapFromCompanyName(name: string): LegalEntityType | undefined {
  const trimmed = name.trim()

  if (!trimmed) {
    return undefined
  }

  if (IP_NAME_PREFIX.test(trimmed)) {
    return 'ИП'
  }

  if (AO_NAME_PREFIX.test(trimmed)) {
    return 'АО'
  }

  if (new RegExp(`^ООО${OPF_NAME_SUFFIX}`, 'i').test(trimmed)) {
    return 'ООО'
  }

  return undefined
}

/** Maps DaData party `type` / `opf` to payer legal entity type (ООО / АО / ИП). */
export function mapLegalEntityTypeFromPartyData(
  data: DadataPartyData,
): LegalEntityType {
  if (data.type === 'INDIVIDUAL') {
    return 'ИП'
  }

  const fromOpf = mapFromOpfShort(normalizeOpfShort(data.opf?.short))
  if (fromOpf) {
    return fromOpf
  }

  const fromName = mapFromCompanyName(
    data.name?.short_with_opf
    ?? data.name?.full_with_opf
    ?? '',
  )
  if (fromName) {
    return fromName
  }

  const inn = data.inn?.replace(/\D/g, '') ?? ''
  if (inn.length === 12) {
    return 'ИП'
  }

  return 'ООО'
}

/** Infers legal entity type from enriched company (name, INN). */
export function mapLegalEntityTypeFromCompany(
  company: Pick<SelectedCompany, 'name' | 'inn'>,
): LegalEntityType {
  const fromName = mapFromCompanyName(company.name)
  if (fromName) {
    return fromName
  }

  const inn = company.inn.replace(/\D/g, '')
  if (inn.length === 12) {
    return 'ИП'
  }

  return 'ООО'
}
