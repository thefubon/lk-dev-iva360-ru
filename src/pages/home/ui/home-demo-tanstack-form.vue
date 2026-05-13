<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { toast } from 'vue-sonner'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Заголовок — минимум 5 символов.')
    .max(32, 'Заголовок — максимум 32 символа.'),
})

const form = useForm({
  defaultValues: {
    title: '',
  },
  validators: {
    onSubmit: formSchema,
  },
  onSubmit: async () => {
    toast.success('TanStack Form: валидация прошла')
  },
})

function isInvalid(field: {
  state: { meta: { isTouched: boolean, isValid: boolean } }
}) {
  return field.state.meta.isTouched && !field.state.meta.isValid
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>TanStack Form + Zod</CardTitle>
      <CardDescription>
        Как в
        <a
          class="text-primary underline-offset-4 hover:underline"
          href="https://www.shadcn-vue.com/docs/forms/tanstack-form"
          rel="noopener noreferrer"
          target="_blank"
        >shadcn-vue / TanStack Form</a>:
        <code class="text-xs">validators.onSubmit</code> и
        <code class="text-xs">form.Field</code>.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form
        id="form-tanstack-demo"
        @submit.prevent="form.handleSubmit"
      >
        <FieldGroup>
          <form.Field
            name="title"
            #default="{ field }"
          >
            <Field :data-invalid="isInvalid(field)">
              <FieldLabel :for="field.name">
                Заголовок
              </FieldLabel>
              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :aria-invalid="isInvalid(field)"
                autocomplete="off"
                placeholder="Например: ошибка входа на мобильном"
                @blur="field.handleBlur"
                @input="field.handleChange(($event.target as HTMLInputElement).value)"
              />
              <FieldDescription>
                После отправки сработает Zod и тост (vue-sonner).
              </FieldDescription>
              <FieldError
                v-if="isInvalid(field)"
                :errors="field.state.meta.errors"
              />
            </Field>
          </form.Field>
        </FieldGroup>
      </form>
    </CardContent>
    <CardFooter class="gap-2">
      <Button
        type="button"
        variant="outline"
        @click="form.reset()"
      >
        Сброс
      </Button>
      <Button type="submit" form="form-tanstack-demo">
        Отправить
      </Button>
    </CardFooter>
  </Card>
</template>
