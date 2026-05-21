import type { SelectedCompany } from './types'

/** Public fallback logo for АО «ИВА360» (DaData party API has no logo field). */
export const DEFAULT_IVA360_LOGO_URL = '/IVA360.svg'

/** Default organization email when DaData has no corporate email. */
export const DEFAULT_IVA360_EMAIL = 'info@iva360.ru'

/** Default organization website when DaData has no corporate site. */
export const DEFAULT_IVA360_WEBSITE = 'iva360.ru'

/** Static fallback for АО «ИВА360» when DaData is unavailable. */
export const DEFAULT_IVA360_COMPANY: SelectedCompany = {
  name: 'АО «ИВА360»',
  inn: '7743314440',
  kpp: '774301001',
  ogrn: '1197746540155',
  address: 'г Москва, ул Михалковская, д 63Б стр 2, помещ 23/5',
  legalAddress: 'г Москва, ул Михалковская, д 63Б стр 2, помещ 23/5',
  postalAddress: '125412, г Москва, ул Михалковская, д 63Б стр 2, помещ 23/5',
  status: 'ACTIVE',
  ownerFullName: 'Матвеев Юрий Алексеевич',
  phone: '+7 (495) 648-66-73',
  email: DEFAULT_IVA360_EMAIL,
  website: DEFAULT_IVA360_WEBSITE,
  logoUrl: DEFAULT_IVA360_LOGO_URL,
}
