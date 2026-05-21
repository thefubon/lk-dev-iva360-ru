import type { ComputedRef, Ref } from 'vue'
import { createContext } from 'reka-ui'

export type AppMode = 'user' | 'admin'

export const APP_MODE_STORAGE_KEY = 'lk:app-mode'

export const [useAppMode, provideAppModeContext] = createContext<{
  mode: Ref<AppMode>
  isAdminMode: ComputedRef<boolean>
  setMode: (mode: AppMode) => void
}>('AppMode')
