<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useRolesPermissionsMatrix } from '@/shared/lib/roles/use-roles-permissions-matrix'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import RolesPermissionMatrix from './roles-permission-matrix.vue'

const rolesMatrix = useRolesPermissionsMatrix()
</script>

<template>
  <main class="container mx-auto flex flex-col gap-6 px-4 py-4">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        Роли и доступы
      </h1>
      <p class="text-muted-foreground text-sm leading-relaxed">
        Роли управляют
        <strong class="font-medium text-foreground">видимостью разделов</strong>
        в меню администратора. Матрица ниже показывает права всех ролей компании.
      </p>
    </header>

    <div class="flex flex-col gap-6">
      <Card class="gap-4 bg-white py-4">
        <CardHeader class="grid-cols-1 gap-2 px-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div class="flex flex-col gap-1">
            <CardTitle class="text-base">
              Матрица прав и видимости
            </CardTitle>
            <CardDescription>
              Все роли компании и их права доступа
            </CardDescription>
          </div>
          <div class="flex flex-wrap items-center gap-2 sm:justify-end">
            <div class="flex items-center gap-2">
              <Switch
                id="roles-compare-mode"
                v-model="rolesMatrix.compareMode"
              />
              <Label
                for="roles-compare-mode"
                class="cursor-pointer text-xs font-normal text-muted-foreground"
              >
                Подсветить различия
              </Label>
            </div>
            <Button
              v-if="rolesMatrix.isDirty"
              type="button"
              size="sm"
              :disabled="rolesMatrix.saving"
              @click="rolesMatrix.saveMatrix"
            >
              <Loader2
                v-if="rolesMatrix.saving"
                class="size-4 animate-spin"
                aria-hidden="true"
              />
              Сохранить
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              @click="rolesMatrix.exportMatrix"
            >
              Экспорт
            </Button>
          </div>
        </CardHeader>

        <div class="px-4 pb-2">
          <RolesPermissionMatrix
            :categories="rolesMatrix.matrix.categories"
            :roles="rolesMatrix.matrixRoles"
            :compare-mode="rolesMatrix.compareMode"
            :is-granted="rolesMatrix.isGranted"
            :row-has-difference="rolesMatrix.rowHasDifference"
            @update:permission="({ permissionId, roleId, granted }) => rolesMatrix.setPermission(permissionId, roleId, granted)"
          />
        </div>
      </Card>
    </div>
  </main>
</template>
