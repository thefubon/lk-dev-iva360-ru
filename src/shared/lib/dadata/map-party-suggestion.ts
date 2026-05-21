import { mapLegalEntityTypeFromPartyData } from './map-legal-entity-type'
import type {
  DadataPartyAddress,
  DadataPartyData,
  DadataPartySuggestion,
  SelectedCompany,
} from './types'

const GENERIC_EMAIL_DOMAINS = new Set([
  'mail.ru',
  'yandex.ru',
  'ya.ru',
  'gmail.com',
  'googlemail.com',
  'bk.ru',
  'list.ru',
  'inbox.ru',
  'internet.ru',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'icloud.com',
  'rambler.ru',
])

function trimOrUndefined(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function pickPartyPhone(data: DadataPartyData): string | undefined {
  const phone = data.phones?.find((entry) => entry.value || entry.unrestricted_value)
  return trimOrUndefined(phone?.value ?? phone?.unrestricted_value)
}

function pickPartyEmail(data: DadataPartyData): string | undefined {
  const entry = data.emails?.find(
    (email) =>
      email.data?.source
      || email.source
      || email.value
      || email.unrestricted_value
      || (email.data?.local && email.data?.domain),
  )

  if (!entry) {
    return undefined
  }

  const fromSource = trimOrUndefined(entry.data?.source ?? entry.source)
  if (fromSource) {
    return fromSource
  }

  const value = trimOrUndefined(entry.value ?? entry.unrestricted_value)
  if (value) {
    return value
  }

  const local = entry.data?.local?.trim()
  const domain = entry.data?.domain?.trim()
  if (local && domain) {
    return `${local}@${domain}`
  }

  return undefined
}

/** Юридический адрес как в ЕГРЮЛ; fallback — стандартизованный value. */
export function pickLegalAddress(address?: DadataPartyAddress | null): string {
  return (
    trimOrUndefined(address?.data?.source)
    ?? trimOrUndefined(address?.value)
    ?? trimOrUndefined(address?.unrestricted_value)
    ?? ''
  )
}

/** Почтовый адрес (полный, с индексом) для доставки. */
export function pickPostalAddress(address?: DadataPartyAddress | null): string | undefined {
  return trimOrUndefined(address?.unrestricted_value)
}

function extractEmailDomain(email?: string): string | undefined {
  if (!email) {
    return undefined
  }

  const at = email.lastIndexOf('@')
  if (at < 0) {
    return undefined
  }

  const domain = email.slice(at + 1).trim().toLowerCase()
  return domain || undefined
}

/** Сайт: в party API нет отдельного поля; берём корпоративный домен из email. */
export function pickPartyWebsite(data: DadataPartyData, email?: string): string | undefined {
  const resolvedEmail = email ?? pickPartyEmail(data)
  const domain = extractEmailDomain(resolvedEmail)

  if (!domain || GENERIC_EMAIL_DOMAINS.has(domain)) {
    return undefined
  }

  return `https://${domain}`
}

export function mapPartySuggestionToCompany(
  suggestion: DadataPartySuggestion,
): SelectedCompany {
  const { data } = suggestion
  const legalAddress = pickLegalAddress(data.address)
  const postalAddress = pickPostalAddress(data.address)
  const email = pickPartyEmail(data)

  return {
    name:
      data.name?.short_with_opf
      ?? data.name?.full_with_opf
      ?? suggestion.value,
    inn: data.inn ?? '',
    legalEntityType: mapLegalEntityTypeFromPartyData(data),
    kpp: data.kpp ?? undefined,
    ogrn: data.ogrn ?? undefined,
    address: legalAddress,
    legalAddress: legalAddress || undefined,
    postalAddress,
    website: pickPartyWebsite(data, email),
    status: data.state?.status ?? 'ACTIVE',
    ownerFullName: trimOrUndefined(data.management?.name),
    email,
    phone: pickPartyPhone(data),
  }
}
