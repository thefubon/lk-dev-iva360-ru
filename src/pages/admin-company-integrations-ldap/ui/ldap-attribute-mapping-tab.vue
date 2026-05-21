<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { useLdapAttributeMapping } from '@/app/composables/useLdapAttributeMapping'
import { Button } from '@/shared/ui/button'
import { Switch } from '@/shared/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@lib/utils'
import LdapCustomMappingDialog from './ldap-custom-mapping-dialog.vue'

const {
  mappings,
  customDialogOpen,
  updateMapping,
  addCustomMapping,
  removeCustomMapping,
  ldapAttributeExists,
} = useLdapAttributeMapping()

const tableHeadClass =
  'px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'

function onCustomMappingSubmit(
  payload: Parameters<typeof addCustomMapping>[0],
) {
  addCustomMapping(payload)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h2 class="text-base font-semibold text-foreground">
        Маппинг атрибутов LDAP → IVA 360
      </h2>
      <Button
        type="button"
        class="shrink-0 gap-1.5"
        @click="customDialogOpen = true"
      >
        <Plus
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        Кастомный
      </Button>
    </div>

    <Table
      class="table-fixed"
      container-class="overflow-visible rounded-md border border-border bg-white"
    >
      <TableHeader>
        <TableRow class="border-border border-b hover:bg-transparent">
          <TableHead :class="cn(tableHeadClass, 'w-[32%]')">
            LDAP-атрибут
          </TableHead>
          <TableHead :class="cn(tableHeadClass, 'w-[34%]')">
            Поле
          </TableHead>
          <TableHead
            :class="cn(tableHeadClass, 'w-[17%] text-center')"
          >
            Обновлять
          </TableHead>
          <TableHead
            :class="cn(tableHeadClass, 'w-[17%] text-center')"
          >
            Обяз.
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="row in mappings"
          :key="row.id"
          class="border-border border-b last:border-b-0 hover:bg-muted/20"
        >
          <TableCell class="px-4 py-3 align-middle">
            <div class="flex items-center gap-2">
              <code class="text-foreground font-semibold font-mono text-sm">
                {{ row.ldapAttribute }}
              </code>
              <Button
                v-if="row.isCustom"
                type="button"
                variant="ghost"
                size="icon"
                class="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Удалить маппинг"
                @click="removeCustomMapping(row.id)"
              >
                <Trash2 class="size-3.5" />
              </Button>
            </div>
          </TableCell>
          <TableCell class="px-4 py-3 align-middle text-sm text-foreground">
            {{ row.fieldLabel }}
          </TableCell>
          <TableCell class="px-4 py-3 text-center align-middle">
            <div class="flex justify-center">
              <Switch
                :id="`mapping-update-${row.id}`"
                :model-value="row.updateOnSync"
                :aria-label="`Обновлять ${row.ldapAttribute}`"
                @update:model-value="updateMapping(row.id, { updateOnSync: $event === true })"
              />
            </div>
          </TableCell>
          <TableCell class="px-4 py-3 text-center align-middle">
            <div class="flex justify-center">
              <Switch
                :id="`mapping-mandatory-${row.id}`"
                :model-value="row.mandatory"
                :aria-label="`Обязательное ${row.ldapAttribute}`"
                @update:model-value="updateMapping(row.id, { mandatory: $event === true })"
              />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <LdapCustomMappingDialog
    v-model:open="customDialogOpen"
    :ldap-attribute-exists="ldapAttributeExists"
    @submit="onCustomMappingSubmit"
  />
</template>
