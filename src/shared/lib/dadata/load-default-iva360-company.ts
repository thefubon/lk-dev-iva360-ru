import { DEFAULT_IVA360_COMPANY } from './default-iva360-company'
import { enrichCompanyByInn } from './enrich-company-by-inn'
import { mapPartySuggestionToCompany } from './map-party-suggestion'
import type {
  DadataPartySuggestResponse,
  DadataPartySuggestion,
  SelectedCompany,
} from './types'

const IVA360_INN = '7743314440'
const IVA360_SEARCH_QUERIES = [IVA360_INN, 'ИВА360'] as const
const ACTIVE_STATUS = 'ACTIVE'

function isActiveSuggestion(suggestion: DadataPartySuggestion): boolean {
  const status = suggestion.data.state?.status
  return status === ACTIVE_STATUS || status == null
}

function pickIva360Suggestion(
  suggestions: DadataPartySuggestion[],
): DadataPartySuggestion | null {
  const active = suggestions.filter(isActiveSuggestion)
  if (active.length === 0) {
    return null
  }

  return active.find((s) => s.data.inn === IVA360_INN) ?? active[0] ?? null
}

async function searchParty(query: string): Promise<DadataPartySuggestion[]> {
  const response = await $fetch<DadataPartySuggestResponse>('/api/dadata/party', {
    method: 'POST',
    body: { query, count: 10 },
  })

  return response.suggestions ?? []
}

function withOrganizationDefaults(company: SelectedCompany): SelectedCompany {
  return {
    ...company,
    ownerFullName: company.ownerFullName ?? DEFAULT_IVA360_COMPANY.ownerFullName,
    phone: company.phone ?? DEFAULT_IVA360_COMPANY.phone,
    email: company.email ?? DEFAULT_IVA360_COMPANY.email,
    website: company.website ?? DEFAULT_IVA360_COMPANY.website,
    logoUrl: company.logoUrl ?? DEFAULT_IVA360_COMPANY.logoUrl,
  }
}

/** Loads АО «ИВА360» from DaData; falls back to static requisites if the API fails. */
export async function loadDefaultIva360Company(): Promise<SelectedCompany> {
  try {
    for (const query of IVA360_SEARCH_QUERIES) {
      const suggestions = await searchParty(query)
      const picked = pickIva360Suggestion(suggestions)

      if (picked) {
        const company = mapPartySuggestionToCompany(picked)
        const enriched = await enrichCompanyByInn(company)
        return withOrganizationDefaults(enriched)
      }
    }

    console.error(
      '[loadDefaultIva360Company] No active IVA360 company found in DaData',
    )
  } catch (error) {
    console.error('[loadDefaultIva360Company] DaData fetch failed', error)
  }

  return DEFAULT_IVA360_COMPANY
}
