<script setup lang="ts">
import {
  Bell,
  Building2,
  FileCode2,
  HardDrive,
  Mail,
  UserPlus,
  UsersRound,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { cn } from '@lib/utils'

type AdminSection = {
  to: string
  title: string
  description: string
  icon: Component
}

const sections: AdminSection[] = [
  {
    to: '/admin/company/settings',
    title: 'Профиль компании',
    description: 'Общие настройки, плательщики и\u00A0контактная информация организации.',
    icon: Building2,
  },
  {
    to: '/admin/users',
    title: 'Пользователи',
    description: 'Список сотрудников, отделы, роли и\u00A0управление доступом.',
    icon: UserPlus,
  },
  {
    to: '/admin/roles',
    title: 'Роли и\u00A0доступы',
    description: 'Матрица прав и\u00A0видимости разделов администратора для ролей компании.',
    icon: UsersRound,
  },
  {
    to: '/admin/integrations/ldap',
    title: 'Интеграции',
    description: 'Подключение LDAP / SSO, API и\u00A0внешних сервисов.',
    icon: FileCode2,
  },
  {
    to: '/admin/notifications',
    title: 'Уведомления',
    description: 'Каналы доставки и\u00A0настройки уведомлений пользователей.',
    icon: Bell,
  },
  {
    to: '/admin/mail/domains',
    title: 'Почта',
    description: 'Домены, почтовые ящики и\u00A0дополнительные настройки корпоративной почты.',
    icon: Mail,
  },
  {
    to: '/admin/disk/settings',
    title: 'Диск',
    description: 'Настройки хранилища, квоты, общие диски и\u00A0история файлов.',
    icon: HardDrive,
  },
]
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Рабочий стол администратора
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Администрирование IVA 360 — центр управления организацией: настройка компании,
        пользователей, доступов и продуктов платформы. Выберите раздел для перехода
        к нужным параметрам.
      </p>
    </header>

    <ul class="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="item in sections" :key="item.to">
        <NuxtLink
          :to="item.to"
          :class="cn(
            'group flex h-full flex-col items-start gap-3 rounded-lg bg-background p-4 text-left transition-all duration-300 sm:flex-row',
            'hover:-translate-y-1 hover:bg-background',
          )"
        >
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted/50 text-foreground"
            aria-hidden="true"
          >
            <component :is="item.icon" class="size-4" />
          </span>
          <span class="flex min-w-0 flex-col gap-1">
            <span class="text-sm font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">{{ item.title }}</span>
            <span class="text-muted-foreground text-xs leading-relaxed">{{ item.description }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
