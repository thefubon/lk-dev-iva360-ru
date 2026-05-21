<script setup lang="ts">
import type { DialogCloseProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { DialogClose } from 'reka-ui'
import { X } from 'lucide-vue-next'
import { Button } from '@/shared/ui/button'
import { cn } from '@lib/utils'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<
  DialogCloseProps & {
    class?: HTMLAttributes['class']
  }
>()

const delegated = reactiveOmit(props, 'class', 'asChild')
</script>

<template>
  <DialogClose
    as-child
    v-bind="delegated"
  >
    <Button
      type="button"
      variant="ghost"
      size="icon"
      data-slot="dialog-close-button"
      :class="cn(
        'size-8 shrink-0 rounded-full bg-muted text-foreground hover:bg-muted/80',
        props.class,
      )"
      aria-label="Закрыть"
      v-bind="$attrs"
    >
      <X
        class="size-4"
        aria-hidden="true"
      />
    </Button>
  </DialogClose>
</template>
