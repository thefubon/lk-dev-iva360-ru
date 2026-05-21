<script setup lang="ts">
import { Building2, Loader2, Search, X } from 'lucide-vue-next'
import { Button } from '@/shared/ui/button'
import { enrichCompanyByInn } from '@/shared/lib/dadata/enrich-company-by-inn'
import { mapPartySuggestionToCompany } from '@/shared/lib/dadata/map-party-suggestion'
import type { DadataPartySuggestion, SelectedCompany } from '@/shared/lib/dadata/types'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Skeleton } from '@/shared/ui/skeleton'

const props = withDefaults(
  defineProps<{
    id?: string
    modelValue?: SelectedCompany | null
    placeholder?: string
    disabled?: boolean
    inModal?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: 'Введите название или ИНН компании',
    disabled: false,
    inModal: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: SelectedCompany | null]
}>()

const { query, suggestions, loading, error, reset } = useDadataPartySearch()

const open = ref(false)
const anchorRef = ref<HTMLElement | null>(null)
const placement = ref<'bottom' | 'top'>('bottom')

const MODAL_DROPDOWN_HEIGHT = 240
const MODAL_DROPDOWN_GAP = 6

const hasQuery = computed(() => query.value.trim().length >= 2)
const hasText = computed(() => query.value.length > 0)

const dropdownPlacementClass = computed(() =>
  placement.value === 'top'
    ? 'bottom-full mb-1.5'
    : 'top-full mt-1.5',
)

const scrollAreaClass = computed(() =>
  props.inModal ? 'h-60 max-h-60 w-full' : 'h-72 w-full',
)

function isInsideAnchor(target: EventTarget | null) {
  return target instanceof Node && Boolean(anchorRef.value?.contains(target))
}

watch(
  () => props.modelValue,
  (company) => {
    if (company) {
      query.value = company.name
      return
    }

    reset()
  },
  { immediate: true },
)

function updatePlacement() {
  if (!props.inModal || !anchorRef.value) {
    placement.value = 'bottom'
    return
  }

  const anchorRect = anchorRef.value.getBoundingClientRect()
  const scrollParent = anchorRef.value.closest('[data-modal-body]') as HTMLElement | null

  if (scrollParent) {
    const parentRect = scrollParent.getBoundingClientRect()
    const spaceBelow = parentRect.bottom - anchorRect.bottom - MODAL_DROPDOWN_GAP
    const spaceAbove = anchorRect.top - parentRect.top - MODAL_DROPDOWN_GAP

    placement.value =
      spaceBelow < MODAL_DROPDOWN_HEIGHT && spaceAbove > spaceBelow
        ? 'top'
        : 'bottom'
    return
  }

  const spaceBelow = window.innerHeight - anchorRect.bottom - MODAL_DROPDOWN_GAP
  const spaceAbove = anchorRect.top - MODAL_DROPDOWN_GAP

  placement.value =
    spaceBelow < MODAL_DROPDOWN_HEIGHT && spaceAbove > spaceBelow
      ? 'top'
      : 'bottom'
}

function openDropdown() {
  if (!props.disabled) {
    updatePlacement()
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

  if (props.inModal) {
    window.addEventListener('resize', updatePlacement)
  }
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)

  if (props.inModal) {
    window.removeEventListener('resize', updatePlacement)
  }
})

async function selectSuggestion(suggestion: DadataPartySuggestion) {
  let company = mapPartySuggestionToCompany(suggestion)

  if (company.inn) {
    company = await enrichCompanyByInn(company)
  }

  query.value = company.name
  emit('update:modelValue', company)
  closeDropdown()
}

function suggestionLabel(suggestion: DadataPartySuggestion): string {
  return (
    suggestion.data.name?.short_with_opf
    ?? suggestion.data.name?.full_with_opf
    ?? suggestion.value
  )
}

function clearSearch() {
  reset()
  emit('update:modelValue', null)
  openDropdown()
}

function suggestionMeta(suggestion: DadataPartySuggestion): string {
  const inn = suggestion.data.inn ? `ИНН ${suggestion.data.inn}` : ''
  const address = suggestion.data.address?.value ?? ''

  return [inn, address].filter(Boolean).join(' · ')
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
      id="company-search-content"
      :class="[
        'absolute inset-x-0 z-20 flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-lg',
        dropdownPlacementClass,
      ]"
      @mousedown.prevent
    >
      <ScrollArea :class="scrollAreaClass">
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
            Компании не найдены
          </p>

          <p
            v-else-if="!hasQuery"
            class="px-3 py-4 text-sm text-muted-foreground"
          >
            Введите минимум 2 символа для поиска
          </p>

          <button
            v-for="suggestion in suggestions"
            :key="`${suggestion.data.inn ?? suggestion.value}-${suggestion.data.kpp ?? ''}`"
            type="button"
            role="option"
            class="flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            @mousedown.prevent
            @click="selectSuggestion(suggestion)"
          >
            <Building2
              class="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium text-foreground">
                {{ suggestionLabel(suggestion) }}
              </span>
              <span class="block truncate text-xs text-muted-foreground">
                {{ suggestionMeta(suggestion) }}
              </span>
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
        Поиск компаний…
      </div>
    </div>
  </div>
</template>
