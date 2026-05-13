<script setup lang="ts">
import type { DialogCloseProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DialogClose } from "reka-ui"
import { X } from "lucide-vue-next"
import { Button } from "@/shared/ui/button"
import { cn } from '@lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<
  DialogCloseProps & {
    class?: HTMLAttributes["class"]
  }
>()

const delegated = reactiveOmit(props, "class", "asChild")
</script>

<template>
  <DialogClose as-child v-bind="delegated">
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      data-slot="sheet-close-button"
      :class="cn('rounded-full shadow-none', props.class)"
      v-bind="$attrs"
    >
      <X class="size-4 shrink-0" data-icon="only" aria-hidden="true" />
      <span class="sr-only">Закрыть</span>
    </Button>
  </DialogClose>
</template>
