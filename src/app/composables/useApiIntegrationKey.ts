import { toast } from 'vue-sonner'
import { copyTextToClipboard } from '@lib/copy-text-to-clipboard'
import {
  DEFAULT_MASKED_API_KEY,
  generateApiIntegrationKey,
  isApiIntegrationKeyCopyable,
  readPersistedApiIntegrationKey,
  writePersistedApiIntegrationKey,
} from '@lib/integrations/api-integration-key'

export function useApiIntegrationKey() {
  const apiKey = ref(DEFAULT_MASKED_API_KEY)

  const canCopyApiKey = computed(() => isApiIntegrationKeyCopyable(apiKey.value))

  onMounted(() => {
    const persisted = readPersistedApiIntegrationKey()
    if (persisted && isApiIntegrationKeyCopyable(persisted)) {
      apiKey.value = persisted
    }
  })

  function regenerateApiKey() {
    const key = generateApiIntegrationKey()
    apiKey.value = key
    writePersistedApiIntegrationKey(key)
    toast.success('Новый ключ сгенерирован')
  }

  async function copyApiKey() {
    if (!canCopyApiKey.value) {
      toast.info('Сначала сгенерируйте ключ — скопировать можно только реальный ключ')
      return
    }

    try {
      await copyTextToClipboard(apiKey.value)
      toast.success('Ключ скопирован в буфер обмена')
    } catch {
      toast.error('Не удалось скопировать')
    }
  }

  return {
    apiKey,
    canCopyApiKey,
    regenerateApiKey,
    copyApiKey,
  }
}
