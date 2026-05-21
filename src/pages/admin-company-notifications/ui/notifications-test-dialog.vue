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
import {
  NOTIFICATION_CHANNEL_LABELS,
  type NotificationChannelId,
} from '@lib/notifications/types'
import { Button } from '@/shared/ui/button'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  enabledChannels: NotificationChannelId[]
}>()

type StepStatus = 'pending' | 'running' | 'success' | 'error'

interface TestStep {
  id: NotificationChannelId
  label: string
  status: StepStatus
}

const STEP_DELAY_MS = 700

const steps = ref<TestStep[]>([])
const testComplete = ref(false)
const testSuccess = ref(true)

let timers: ReturnType<typeof setTimeout>[] = []

const stepLabels: Record<NotificationChannelId, string> = {
  email: 'Проверка e-mail...',
  sms: 'Проверка SMS...',
  bell: 'Проверка in-app (колокольчик)...',
  ivaBot: 'Проверка бота iVA...',
}

function createInitialSteps(): TestStep[] {
  return props.enabledChannels.map((channelId) => ({
    id: channelId,
    label: stepLabels[channelId],
    status: 'pending' as StepStatus,
  }))
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

function finishTest(success: boolean) {
  testComplete.value = true
  testSuccess.value = success
}

function runTest() {
  clearTimers()
  resetSteps()

  const stepList = steps.value

  if (stepList.length === 0) {
    finishTest(false)
    return
  }

  stepList[0]!.status = 'running'

  for (let index = 0; index < stepList.length - 1; index += 1) {
    const nextIndex = index + 1
    timers.push(setTimeout(() => {
      stepList[index]!.status = 'success'
      stepList[nextIndex]!.status = 'running'
    }, STEP_DELAY_MS * nextIndex))
  }

  timers.push(setTimeout(() => {
    const success = Math.random() > 0.12
    stepList[stepList.length - 1]!.status = success ? 'success' : 'error'
    finishTest(success)
  }, STEP_DELAY_MS * stepList.length))
}

watch(open, (isOpen) => {
  if (isOpen) {
    runTest()
  } else {
    clearTimers()
    resetSteps()
  }
})

watch(
  () => props.enabledChannels,
  () => {
    if (open.value) {
      runTest()
    }
  },
)

onBeforeUnmount(() => {
  clearTimers()
})

function handleRetry() {
  runTest()
}

function handleClose() {
  open.value = false
}

const enabledChannelsLabel = computed(() => {
  if (props.enabledChannels.length === 0) {
    return 'нет активных каналов'
  }

  return props.enabledChannels
    .map((channelId) => NOTIFICATION_CHANNEL_LABELS[channelId])
    .join(', ')
})
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
              Тест уведомлений
            </DialogTitle>
            <DialogDescription class="mt-0.5 text-sm text-muted-foreground">
              Каналы: {{ enabledChannelsLabel }}
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
            v-if="steps.length > 0"
            class="flex flex-col gap-3"
            aria-live="polite"
            aria-label="Шаги проверки уведомлений"
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

          <p
            v-else
            class="text-sm text-muted-foreground"
          >
            Включите хотя бы один канал доставки на вкладке «Каналы уведомлений».
          </p>

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
                  ? 'Тестовое уведомление успешно отправлено по всем активным каналам'
                  : steps.length === 0
                    ? 'Нет активных каналов для проверки'
                    : 'Не удалось доставить тестовое уведомление (демо)'
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
            :disabled="steps.length === 0 || (!testComplete && steps.some((s) => s.status === 'running'))"
            @click="handleRetry"
          >
            Повторить тест
          </Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
