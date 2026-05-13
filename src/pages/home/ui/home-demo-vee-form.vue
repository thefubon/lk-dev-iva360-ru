<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { Field as VeeField, useForm } from 'vee-validate'
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/shared/ui/input-group'

const validationSchema = toTypedSchema(
  z.object({
    title: z
      .string()
      .min(5, 'Заголовок — минимум 5 символов.')
      .max(32, 'Заголовок — максимум 32 символа.'),
    description: z
      .string()
      .min(10, 'Описание — минимум 10 символов.')
      .max(100, 'Описание — максимум 100 символов.'),
  }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: {
    title: '',
    description: '',
  },
})

const onSubmit = handleSubmit((data) => {
  toast.success('VeeValidate + Zod', {
    description: JSON.stringify(data, null, 2),
  })
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>VeeValidate + Zod</CardTitle>
      <CardDescription>
        Как в
        <a
          class="text-primary underline-offset-4 hover:underline"
          href="https://www.shadcn-vue.com/docs/forms/vee-validate"
          rel="noopener noreferrer"
          target="_blank"
        >shadcn-vue / VeeValidate</a>:
        <code class="text-xs">toTypedSchema</code>,
        <code class="text-xs">useForm</code>,
        <code class="text-xs">Field</code> (vee) + UI Field.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form id="form-vee-demo" @submit="onSubmit">
        <FieldGroup>
          <VeeField v-slot="{ field, errors }" name="title">
            <Field :data-invalid="errors.length ? true : undefined">
              <FieldLabel for="form-vee-demo-title">
                Заголовок
              </FieldLabel>
              <Input
                id="form-vee-demo-title"
                v-bind="field"
                :aria-invalid="!!errors.length"
                autocomplete="off"
                placeholder="Кратко опишите проблему"
              />
              <FieldError v-if="errors.length" :errors="errors" />
            </Field>
          </VeeField>

          <VeeField v-slot="{ field, errors }" name="description">
            <Field :data-invalid="errors.length ? true : undefined">
              <FieldLabel for="form-vee-demo-description">
                Описание
              </FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  id="form-vee-demo-description"
                  v-bind="field"
                  :rows="4"
                  :aria-invalid="!!errors.length"
                  class="min-h-24 resize-none"
                  placeholder="Шаги воспроизведения, ожидаемое и фактическое поведение"
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText class="tabular-nums">
                    {{ field.value?.length || 0 }}/100
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                До 100 символов, минимум 10 для отправки.
              </FieldDescription>
              <FieldError v-if="errors.length" :errors="errors" />
            </Field>
          </VeeField>
        </FieldGroup>
      </form>
    </CardContent>
    <CardFooter class="gap-2">
      <Button type="button" variant="outline" @click="resetForm()">
        Сброс
      </Button>
      <Button type="submit" form="form-vee-demo">
        Отправить
      </Button>
    </CardFooter>
  </Card>
</template>
