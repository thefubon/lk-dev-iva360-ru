<script setup lang="ts">
import { Mail, Phone, Shield, UserRound } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Field, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { AdminPageSection } from '@/widgets/admin-page-section'

interface ContactFormSnapshot {
  billingResponsibleFullName: string
  billingEmail: string
  billingPhone: string
  technicalFullName: string
  technicalNotificationsEmail: string
  technicalSecurityEmail: string
}

const DEFAULT_CONTACTS: ContactFormSnapshot = {
  billingResponsibleFullName: 'Смирнов Александр Иванович',
  billingEmail: 'billing@example-corp.ru',
  billingPhone: '+7 (495) 123-45-67',
  technicalFullName: 'Иванова Мария',
  technicalNotificationsEmail: 'tech@example-corp.ru',
  technicalSecurityEmail: 'security@example-corp.ru',
}

const contactForm = reactive({ ...DEFAULT_CONTACTS })
const savedSnapshot = ref<ContactFormSnapshot>({ ...DEFAULT_CONTACTS })

function normalizePhoneForCompare(phone: string): string {
  return phone.replace(/\D/g, '')
}

function captureSnapshot(): ContactFormSnapshot {
  return {
    billingResponsibleFullName: contactForm.billingResponsibleFullName,
    billingEmail: contactForm.billingEmail,
    billingPhone: contactForm.billingPhone,
    technicalFullName: contactForm.technicalFullName,
    technicalNotificationsEmail: contactForm.technicalNotificationsEmail,
    technicalSecurityEmail: contactForm.technicalSecurityEmail,
  }
}

const isDirty = computed(() => {
  const snapshot = savedSnapshot.value
  const current = captureSnapshot()

  return (
    current.billingResponsibleFullName !== snapshot.billingResponsibleFullName
    || current.billingEmail !== snapshot.billingEmail
    || normalizePhoneForCompare(current.billingPhone) !== normalizePhoneForCompare(snapshot.billingPhone)
    || current.technicalFullName !== snapshot.technicalFullName
    || current.technicalNotificationsEmail !== snapshot.technicalNotificationsEmail
    || current.technicalSecurityEmail !== snapshot.technicalSecurityEmail
  )
})

function saveContactSettings() {
  if (!isDirty.value) {
    return
  }

  savedSnapshot.value = captureSnapshot()
  toast.success('Контактная информация сохранена')
}
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Контактная информация
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Контактные данные для биллинга и технических вопросов.
      </p>
    </header>

    <AdminPageSection class="gap-6">
      <div class="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-0">
        <Card class="border-0 bg-background shadow-none">
          <CardHeader>
            <CardTitle>Биллинг</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-4">
            <Field class="gap-2">
              <FieldLabel for="billing-responsible-full-name">
                ФИО ответственного
              </FieldLabel>
              <Input
                id="billing-responsible-full-name"
                v-model="contactForm.billingResponsibleFullName"
                type="text"
                variant="default"
                class="h-10"
                autocomplete="name"
                :icon-left="UserRound"
              />
            </Field>

            <Field class="gap-2">
              <FieldLabel for="billing-email">
                Email для счетов
              </FieldLabel>
              <Input
                id="billing-email"
                v-model="contactForm.billingEmail"
                type="email"
                variant="default"
                class="h-10"
                autocomplete="email"
                :icon-left="Mail"
              />
            </Field>

            <Field class="gap-2">
              <FieldLabel for="billing-phone">
                Телефон
              </FieldLabel>
              <Input
                id="billing-phone"
                v-model="contactForm.billingPhone"
                type="tel"
                variant="default"
                class="h-10"
                autocomplete="tel"
                placeholder="+7 (000) 000 00 00"
                :icon-left="Phone"
              />
            </Field>
          </CardContent>
        </Card>

        <div
          class="bg-border h-px w-full lg:mx-6 lg:h-auto lg:w-px lg:self-stretch"
          role="separator"
          aria-hidden="true"
        />

        <Card class="border-0 bg-background shadow-none">
          <CardHeader>
            <CardTitle>Технические вопросы</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-4">
            <Field class="gap-2">
              <FieldLabel for="technical-full-name">
                ФИО
              </FieldLabel>
              <Input
                id="technical-full-name"
                v-model="contactForm.technicalFullName"
                type="text"
                variant="default"
                class="h-10"
                autocomplete="name"
                :icon-left="UserRound"
              />
            </Field>

            <Field class="gap-2">
              <FieldLabel for="technical-notifications-email">
                Email уведомлений
              </FieldLabel>
              <Input
                id="technical-notifications-email"
                v-model="contactForm.technicalNotificationsEmail"
                type="email"
                variant="default"
                class="h-10"
                autocomplete="email"
                :icon-left="Mail"
              />
            </Field>

            <Field class="gap-2">
              <FieldLabel for="technical-security-email">
                Email безопасности
              </FieldLabel>
              <Input
                id="technical-security-email"
                v-model="contactForm.technicalSecurityEmail"
                type="email"
                variant="default"
                class="h-10"
                autocomplete="email"
                :icon-left="Shield"
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div class="flex justify-start border-t border-border pt-4">
        <Button
          type="button"
          :variant="isDirty ? 'default' : 'secondary'"
          :disabled="!isDirty"
          @click="saveContactSettings"
        >
          Сохранить
        </Button>
      </div>
    </AdminPageSection>
  </main>
</template>
