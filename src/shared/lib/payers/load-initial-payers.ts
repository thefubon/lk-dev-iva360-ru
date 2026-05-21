import { enrichCompanyByInn } from '@/shared/lib/dadata/enrich-company-by-inn'
import { fetchPartyByInn } from '@/shared/lib/dadata/fetch-party-by-inn'
import { loadDefaultIva360Company } from '@/shared/lib/dadata/load-default-iva360-company'
import { companyToPayerFields } from './company-to-payer'
import type { Payer } from './types'

/** ПАО Сбербанк — well-known company with full DaData requisites. */
const SECOND_PAYER_INN = '7707083893'

export async function loadInitialPayers(): Promise<Payer[]> {
  const [iva360Company, secondRaw] = await Promise.all([
    loadDefaultIva360Company(),
    fetchPartyByInn(SECOND_PAYER_INN),
  ])

  const secondCompany = secondRaw
    ? await enrichCompanyByInn(secondRaw)
    : null

  const payers: Payer[] = [
    {
      id: 'p1',
      ...companyToPayerFields(iva360Company, { isDefault: true }),
    },
  ]

  if (secondCompany) {
    payers.push({
      id: 'p2',
      ...companyToPayerFields(secondCompany),
    })
  }

  return payers
}
