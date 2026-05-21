<script setup lang="ts">
import { Loader2, Search, User, X } from 'lucide-vue-next'
import { mapFioSuggestionToSelected } from '@/shared/lib/dadata/map-fio-suggestion'
import type { DadataFioSuggestion, SelectedFio } from '@/shared/lib/dadata/types'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Skeleton } from '@/shared/ui/skeleton'

const props = withDefaults(
  defineProps<{
    id?: string
    modelValue?: SelectedFio | null
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: 'Введите ФИО нового владельца',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: SelectedFio | null]
}>()

const { query, suggestions, loading, error, reset } = useDadataFioSearch()

const open = ref(false)
const anchorRef = ref<HTMLElement | null>(null)

const hasQuery = computed(() => query.value.trim().length >= 2)
const hasText = computed(() => query.value.length > 0)

function isInsideAnchor(target: EventTarget | null) {
  return target instanceof Node && Boolean(anchorRef.value?.contains(target))
}

watch(
  () => props.modelValue,
  (fio) => {
    if (fio) {
      query.value = fio.fullName
    }
  },
  { immediate: true },
)

function openDropdown() {
  if (!props.disabled) {
    open.value = true
  }
}

function closeDropdown() {
  open.value = false
}

function onInputBlur(event: FocusEvent) {
  const nextTarget = event.relatedTarget as Node | null

  if (nextTarget && isInsideAnchor(nextTarget)) {
    return
  }

  closeDropdown()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value || isInsideAnchor(event.target)) {
    return
  }

  closeDropdown()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

function selectSuggestion(suggestion: DadataFioSuggestion) {
  const fio = mapFioSuggestionToSelected(suggestion)
  query.value = fio.fullName
  emit('update:modelValue', fio)
  closeDropdown()
}

function clearSearch() {
  reset()
  emit('update:modelValue', null)
  openDropdown()
}
</script>

<template>
  <div
    ref="anchorRef"
    class="relative w-full"
  >
    <div class="relative">
      <Input
        :id="props.id"
        v-model="query"
        type="text"
        variant="default"
        :placeholder="placeholder"
        :icon-left="Search"
        autocomplete="off"
        :disabled="disabled"
        :class="['h-10', hasText && 'pr-9']"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="open"
        @focus="openDropdown"
        @click="openDropdown"
        @blur="onInputBlur"
        @keydown.escape="closeDropdown"
      />

      <Button
        v-if="hasText"
        type="button"
        variant="ghost"
        size="icon-sm"
        class="absolute right-1 top-1/2 -translate-y-1/2"
        aria-label="Очистить поиск"
        :disabled="disabled"
        tabindex="-1"
        @mousedown.prevent
        @click="clearSearch"
      >
        <X class="size-4" />
      </Button>
    </div>

    <div
      v-if="open"
      class="absolute inset-x-0 top-full z-50 mt-1.5 flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-lg"
      @mousedown.prevent
    >
      <ScrollArea class="h-56 w-full">
        <div
          role="listbox"
          class="flex flex-col gap-0.5 p-1"
        >
          <div
            v-if="loading"
            class="flex flex-col gap-2 p-3"
          >
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>

          <p
            v-else-if="error"
            class="px-3 py-4 text-sm text-destructive"
          >
            {{ error }}
          </p>

          <p
            v-else-if="hasQuery && suggestions.length === 0"
            class="px-3 py-4 text-sm text-muted-foreground"
          >
            ФИО не найдены
          </p>

          <p
            v-else-if="!hasQuery"
            class="px-3 py-4 text-sm text-muted-foreground"
          >
            Введите минимум 2 символа для поиска
          </p>

          <button
            v-for="suggestion in suggestions"
            :key="suggestion.value"
            type="button"
            role="option"
            class="flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            @mousedown.prevent
            @click="selectSuggestion(suggestion)"
          >
            <User
              class="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {{ suggestion.value }}
            </span>
          </button>
        </div>
      </ScrollArea>

      <div
        v-if="loading"
        class="flex shrink-0 items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground"
      >
        <Loader2
          class="size-3.5 animate-spin"
          aria-hidden="true"
        />
        Поиск по ФИО…
      </div>
    </div>
  </div>
</template>
