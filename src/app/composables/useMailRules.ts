import {
  cloneMailRules,
  createDefaultMailRules,
  normalizePersistedMailRules,
} from '@lib/mail/default-mail-additional-data'
import {
  MAIL_RULES_STORAGE_KEY,
  MAIL_RULE_ACTION_LABELS,
  type MailRule,
  type MailRulePayload,
  type MailRulesPersistedState,
} from '@lib/mail/additional-settings-types'

function readPersistedState(): MailRulesPersistedState | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = localStorage.getItem(MAIL_RULES_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { rules?: unknown, savedAt?: string }
    const rules = normalizePersistedMailRules(parsed.rules)
    if (!rules || typeof parsed.savedAt !== 'string') {
      return null
    }

    return { rules, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

function writePersistedState(rules: MailRule[]) {
  if (!import.meta.client) {
    return
  }

  try {
    const state: MailRulesPersistedState = {
      rules: cloneMailRules(rules),
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(MAIL_RULES_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function createRuleId(): string {
  return `rule-${Date.now()}`
}

export function useMailRules() {
  const rules = ref<MailRule[]>(createDefaultMailRules())
  const ready = ref(false)

  function persist() {
    writePersistedState(rules.value)
  }

  function loadFromStorage() {
    const persisted = readPersistedState()
    rules.value = persisted?.rules ?? createDefaultMailRules()
    ready.value = true
  }

  onMounted(() => {
    loadFromStorage()
  })

  function addRule(payload: MailRulePayload): MailRule {
    const rule: MailRule = {
      id: createRuleId(),
      ...payload,
      actionLabel: payload.actionLabel || MAIL_RULE_ACTION_LABELS[payload.action],
    }
    rules.value = [...rules.value, rule].sort((a, b) => b.priority - a.priority)
    persist()
    return rule
  }

  function updateRule(id: string, payload: MailRulePayload) {
    rules.value = rules.value
      .map(rule =>
        rule.id === id
          ? {
              ...rule,
              ...payload,
              actionLabel: payload.actionLabel || MAIL_RULE_ACTION_LABELS[payload.action],
            }
          : rule,
      )
      .sort((a, b) => b.priority - a.priority)
    persist()
  }

  function removeRule(id: string) {
    rules.value = rules.value.filter(rule => rule.id !== id)
    persist()
  }

  return {
    rules,
    ready,
    persist,
    addRule,
    updateRule,
    removeRule,
  }
}
