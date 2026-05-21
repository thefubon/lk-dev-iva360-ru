import { fetchPartyByInn } from './fetch-party-by-inn'
import type { SelectedCompany } from './types'

/** Объединяет данные suggest/findById: реквизиты и контакты — из полного ответа findById. */
export function mergePartyCompanies(
  base: SelectedCompany,
  full: SelectedCompany,
): SelectedCompany {
  return {
    ...base,
    legalEntityType: full.legalEntityType ?? base.legalEntityType,
    kpp: full.kpp ?? base.kpp,
    ogrn: full.ogrn ?? base.ogrn,
    address: full.address || base.address,
    legalAddress: full.legalAddress ?? base.legalAddress,
    postalAddress: full.postalAddress ?? base.postalAddress,
    actualAddress: full.actualAddress ?? base.actualAddress,
    website: full.website ?? base.website,
    status: full.status ?? base.status,
    email: full.email ?? base.email,
    phone: full.phone ?? base.phone,
    ownerFullName: full.ownerFullName ?? base.ownerFullName,
    logoUrl: base.logoUrl ?? full.logoUrl,
  }
}

/** Догружает реквизиты через findById/party (полный ответ DaData). */
export async function enrichCompanyByInn(
  company: SelectedCompany,
): Promise<SelectedCompany> {
  const inn = company.inn.trim()
  if (!inn) {
    return company
  }

  try {
    const full = await fetchPartyByInn(inn, company.kpp)
    return full ? mergePartyCompanies(company, full) : company
  } catch {
    return company
  }
}
