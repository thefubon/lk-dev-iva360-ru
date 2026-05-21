<script setup lang="ts">
import { useMailPolicies } from '@/app/composables/useMailPolicies'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'

const { policies, ready: policiesReady, savePolicies } = useMailPolicies()

function onSavePolicies() {
  savePolicies()
}
</script>

<template>
  <div
    class="flex flex-col gap-4"
    aria-labelledby="mail-policies-heading"
  >
    <div class="flex min-w-0 flex-col gap-1">
      <h2
        id="mail-policies-heading"
        class="text-base font-medium text-foreground"
      >
        Политики почты
      </h2>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Архив, очистка спама и корзины, корпоративная подпись и ограничения размера писем
      </p>
    </div>

    <div
      v-if="!policiesReady"
      class="text-muted-foreground text-sm"
    >
      Загрузка политик...
    </div>

    <div
      v-else
      class="grid gap-4 lg:grid-cols-2"
    >
      <Card class="gap-4 bg-white py-4">
        <CardHeader class="px-4">
          <CardTitle class="text-base">
            Настройка доменов
          </CardTitle>
          <CardDescription>
            Общие параметры почтовых доменов компании
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4 px-4">
          <div class="flex items-center justify-between gap-4 border-b border-border pb-3">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                Разрешить поддомены
              </p>
              <FieldDescription>
                Автоматическое создание ящиков на поддоменах
              </FieldDescription>
            </div>
            <Switch
              id="mail-allow-subdomains"
              v-model="policies.domainSettings.allowSubdomains"
              @update:model-value="onSavePolicies"
            />
          </div>

          <div class="flex items-center justify-between gap-4 border-b border-border pb-3">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                Catch-all
              </p>
              <FieldDescription>
                Перенаправление писем на несуществующие адреса
              </FieldDescription>
            </div>
            <Switch
              id="mail-catch-all"
              v-model="policies.domainSettings.catchAllEnabled"
              @update:model-value="onSavePolicies"
            />
          </div>

          <Field class="gap-2">
            <FieldLabel for="mail-catch-all-address">
              Адрес catch-all
            </FieldLabel>
            <Input
              id="mail-catch-all-address"
              v-model="policies.domainSettings.catchAllAddress"
              type="email"
              variant="default"
              class="h-10 font-mono text-sm"
              :disabled="!policies.domainSettings.catchAllEnabled"
              @change="onSavePolicies"
            />
          </Field>
        </CardContent>
      </Card>

      <Card class="gap-4 bg-white py-4">
        <CardHeader class="px-4">
          <CardTitle class="text-base">
            Настройка политики архивации
          </CardTitle>
          <CardDescription>
            Хранение копий писем в архиве
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4 px-4">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                Архивирование включено
              </p>
            </div>
            <Switch
              id="mail-archive-enabled"
              v-model="policies.archivePolicy.enabled"
              @update:model-value="onSavePolicies"
            />
          </div>
          <Field class="gap-2">
            <FieldLabel for="mail-archive-days">
              Срок хранения, дней
            </FieldLabel>
            <Input
              id="mail-archive-days"
              v-model.number="policies.archivePolicy.retentionDays"
              type="number"
              min="1"
              variant="default"
              class="h-10"
              :disabled="!policies.archivePolicy.enabled"
              @change="onSavePolicies"
            />
          </Field>
        </CardContent>
      </Card>

      <Card class="gap-4 bg-white py-4">
        <CardHeader class="px-4">
          <CardTitle class="text-base">
            Настройка политики очистки спама
          </CardTitle>
          <CardDescription>
            Автоматическое удаление писем из папки «Спам»
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4 px-4">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                Автоочистка спама
              </p>
            </div>
            <Switch
              id="mail-spam-cleanup"
              v-model="policies.spamCleanupPolicy.enabled"
              @update:model-value="onSavePolicies"
            />
          </div>
          <Field class="gap-2">
            <FieldLabel for="mail-spam-days">
              Удалять через, дней
            </FieldLabel>
            <Input
              id="mail-spam-days"
              v-model.number="policies.spamCleanupPolicy.retentionDays"
              type="number"
              min="1"
              variant="default"
              class="h-10"
              :disabled="!policies.spamCleanupPolicy.enabled"
              @change="onSavePolicies"
            />
          </Field>
        </CardContent>
      </Card>

      <Card class="gap-4 bg-white py-4">
        <CardHeader class="px-4">
          <CardTitle class="text-base">
            Настройка политики очистки корзины
          </CardTitle>
          <CardDescription>
            Срок хранения удалённых писем
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4 px-4">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                Автоочистка корзины
              </p>
            </div>
            <Switch
              id="mail-trash-cleanup"
              v-model="policies.trashCleanupPolicy.enabled"
              @update:model-value="onSavePolicies"
            />
          </div>
          <Field class="gap-2">
            <FieldLabel for="mail-trash-days">
              Удалять через, дней
            </FieldLabel>
            <Input
              id="mail-trash-days"
              v-model.number="policies.trashCleanupPolicy.retentionDays"
              type="number"
              min="1"
              variant="default"
              class="h-10"
              :disabled="!policies.trashCleanupPolicy.enabled"
              @change="onSavePolicies"
            />
          </Field>
        </CardContent>
      </Card>

      <Card class="gap-4 bg-white py-4 lg:col-span-2">
        <CardHeader class="px-4">
          <CardTitle class="text-base">
            Настройка корп. подписи
          </CardTitle>
          <CardDescription>
            Подпись, добавляемая к исходящим письмам
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4 px-4">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">
                Корпоративная подпись
              </p>
            </div>
            <Switch
              id="mail-signature-enabled"
              v-model="policies.corporateSignature.enabled"
              @update:model-value="onSavePolicies"
            />
          </div>
          <Field class="gap-2">
            <FieldLabel for="mail-signature-text">
              Текст подписи
            </FieldLabel>
            <Textarea
              id="mail-signature-text"
              v-model="policies.corporateSignature.html"
              class="min-h-28 resize-y font-mono text-sm"
              :disabled="!policies.corporateSignature.enabled"
              @change="onSavePolicies"
            />
          </Field>
        </CardContent>
      </Card>

      <Card class="gap-4 bg-white py-4 lg:col-span-2">
        <CardHeader class="px-4">
          <CardTitle class="text-base">
            Настройка размера писем
          </CardTitle>
          <CardDescription>
            Ограничения на входящие, исходящие письма и вложения
          </CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4 px-4 sm:grid-cols-3">
          <Field class="gap-2">
            <FieldLabel for="mail-max-incoming">
              Входящие, МБ
            </FieldLabel>
            <Input
              id="mail-max-incoming"
              v-model.number="policies.emailSizeLimits.maxIncomingMb"
              type="number"
              min="1"
              variant="default"
              class="h-10"
              @change="onSavePolicies"
            />
          </Field>
          <Field class="gap-2">
            <FieldLabel for="mail-max-outgoing">
              Исходящие, МБ
            </FieldLabel>
            <Input
              id="mail-max-outgoing"
              v-model.number="policies.emailSizeLimits.maxOutgoingMb"
              type="number"
              min="1"
              variant="default"
              class="h-10"
              @change="onSavePolicies"
            />
          </Field>
          <Field class="gap-2">
            <FieldLabel for="mail-max-attachment">
              Вложения, МБ
            </FieldLabel>
            <Input
              id="mail-max-attachment"
              v-model.number="policies.emailSizeLimits.maxAttachmentMb"
              type="number"
              min="1"
              variant="default"
              class="h-10"
              @change="onSavePolicies"
            />
          </Field>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
