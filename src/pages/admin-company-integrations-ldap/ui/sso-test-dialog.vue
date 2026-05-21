<script setup lang="ts">
import { Check, Loader2, X, XCircle } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { Button } from '@/shared/ui/button'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  providerName: string
  providerDescription?: string
  protocol?: string
}>()

type StepStatus = 'pending' | 'running' | 'success' | 'error'

interface TestStep {
  id: string
  label: string
  status: StepStatus
}

const STEP_DELAY_MS = 750

const providerDisplayName = computed(() => {
  if (props.providerDescription) {
    return `${props.providerName} ${props.providerDescription}`
  }
  return props.providerName
})

const dialogTitle = computed(() => `Тест SSO — ${providerDisplayName.value}`)

const stepsAriaLabel = computed(
  () => `Шаги проверки SSO (${providerDisplayName.value})`,
)

const steps = ref<TestStep[]>(createInitialSteps())
const testComplete = ref(false)
const testSuccess = ref(true)

let timers: ReturnType<typeof setTimeout>[] = []

function isOidcProtocol(protocol?: string) {
  return protocol?.includes('OIDC') ?? false
}

function createInitialSteps(): TestStep[] {
  const { providerName, protocol } = props

  if (isOidcProtocol(protocol)) {
    return [
      {
        id: 'metadata',
        label: `Проверка OpenID Configuration (${providerName})...`,
        status: 'pending',
      },
      { id: 'acs', label: 'Проверка Redirect URI...', status: 'pending' },
      {
        id: 'redirect',
        label: `Имитация OIDC-редиректа на ${providerName}...`,
        status: 'pending',
      },
    ]
  }

  return [
    {
      id: 'metadata',
      label: `Проверка метаданных ${providerName}...`,
      status: 'pending',
    },
    { id: 'acs', label: 'Проверка ACS URL...', status: 'pending' },
    {
      id: 'redirect',
      label: `Имитация SAML-редиректа на ${providerName}...`,
      status: 'pending',
    },
  ]
}

function clearTimers() {
  for (const timer of timers) {
    clearTimeout(timer)
  }
  timers = []
}

function resetSteps() {
  steps.value = createInitialSteps()
  testComplete.value = false
  testSuccess.value = true
}

function runTest() {
  clearTimers()
  resetSteps()

  const stepList = steps.value

  stepList[0]!.status = 'running'

  timers.push(setTimeout(() => {
    stepList[0]!.status = 'success'
    stepList[1]!.status = 'running'
  }, STEP_DELAY_MS))

  timers.push(setTimeout(() => {
    stepList[1]!.status = 'success'
    stepList[2]!.status = 'running'
  }, STEP_DELAY_MS * 2))

  timers.push(setTimeout(() => {
    const success = Math.random() > 0.15
    stepList[2]!.status = success ? 'success' : 'error'
    testComplete.value = true
    testSuccess.value = success
  }, STEP_DELAY_MS * 3))
}

watch(open, (isOpen) => {
  if (isOpen) {
    runTest()
  } else {
    clearTimers()
    resetSteps()
  }
})

onBeforeUnmount(() => {
  clearTimers()
})

function handleRetry() {
  runTest()
}

function handleClose() {
  open.value = false
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-foreground/50"
      />
      <DialogContent
        class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex w-[calc(100vw-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background p-0 shadow-foreground-5 outline-none duration-200"
      >
        <div class="flex shrink-0 items-start justify-between border-b border-border px-4 py-3">
          <div class="min-w-0 flex-1 pr-2">
            <DialogTitle class="text-base font-medium text-foreground">
              {{ dialogTitle }}
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Протокол: {{ props.protocol || '—' }}
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 rounded-full bg-muted text-foreground hover:bg-muted/80"
              aria-label="Закрыть"
              @click="handleClose"
            >
              <X />
            </Button>
          </DialogClose>
        </div>

        <div class="flex flex-col gap-4 px-4 py-4">
          <ul
            class="flex flex-col gap-3"
            aria-live="polite"
            :aria-label="stepsAriaLabel"
          >
            <li
              v-for="step in steps"
              :key="step.id"
              class="flex items-center gap-3"
            >
              <span
                class="flex size-6 shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                <Loader2
                  v-if="step.status === 'running'"
                  class="size-4 animate-spin text-primary"
                />
                <Check
                  v-else-if="step.status === 'success'"
                  class="size-4 text-primary"
                />
                <XCircle
                  v-else-if="step.status === 'error'"
                  class="size-4 text-destructive"
                />
                <span
                  v-else
                  class="size-2 rounded-full bg-muted-foreground/30"
                />
              </span>
              <span
                class="text-sm"
                :class="step.status === 'pending'
                  ? 'text-muted-foreground'
                  : 'text-foreground'"
              >
                {{ step.label }}
              </span>
            </li>
          </ul>

          <div
            v-if="testComplete"
            role="status"
            class="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
            :class="testSuccess
              ? 'border-primary/25 bg-primary/10 text-primary'
              : 'border-destructive/25 bg-destructive/10 text-destructive'"
          >
            <Check
              v-if="testSuccess"
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            <XCircle
              v-else
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              {{
                testSuccess
                  ? `SSO-соединение с ${props.providerName} успешно`
                  : `Не удалось установить SSO-соединение с ${props.providerName} (демо)`
              }}
            </span>
          </div>
        </div>

        <div class="flex shrink-0 justify-end gap-2 border-t border-border bg-background px-4 py-3">
          <Button
            type="button"
            variant="outline"
            @click="handleClose"
          >
            Закрыть
          </Button>
          <Button
            type="button"
            :disabled="!testComplete && steps.some((s) => s.status === 'running')"
            @click="handleRetry"
          >
            Повторить тест
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
